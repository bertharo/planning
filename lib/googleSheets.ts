interface SheetConfig {
  sheetsUrl?: string
  sheetName?: string
  apiKey?: string
  autoRefresh?: boolean
}

interface SheetData {
  values: string[][]
  range: string
  sheetName: string
}

export class GoogleSheetsService {
  async getSheetData(config: SheetConfig, range?: string): Promise<SheetData | null> {
    try {
      if (!config.apiKey || !config.sheetsUrl) {
        console.log('Missing API key or sheets URL')
        return null
      }

      // Extract sheet ID from URL
      const sheetId = this.extractSheetId(config.sheetsUrl)
      if (!sheetId) {
        console.error('Invalid Google Sheets URL')
        return null
      }

      // Determine the range to read
      // For large sheets, use a more targeted range
      const sheetName = config.sheetName || 'Sheet1'
      const fullRange = range || `${sheetName}!A1:Z1000` // Limit to first 1000 rows for large sheets

      console.log(`Reading from sheet: ${sheetId}, range: ${fullRange}`)

      // Make API call to Google Sheets using fetch
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(fullRange)}?key=${config.apiKey}`
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const values = data.values || []
      
      return {
        values,
        range: fullRange,
        sheetName
      }
    } catch (error) {
      console.error('Error reading from Google Sheets:', error)
      return null
    }
  }

  async findDataForQuery(config: SheetConfig, query: {
    product?: string
    region?: string
    segment?: string
    timePeriod?: string
    metric?: string
  }): Promise<any> {
    try {
      // For large sheets, try to find the data more efficiently
      // First, try to get just the headers and a small sample
      const headerData = await this.getSheetData(config, 'A1:Z1') // Just headers
      if (!headerData || !headerData.values.length) {
        return null
      }

      const headers = headerData.values[0]
      console.log('Headers found:', headers)

      // Now try to find the specific row by searching in chunks
      // For very large sheets, use smaller chunks to avoid API limits
      const searchRange = 'A2:Z101' // Skip header, search first 100 data rows
      const sheetData = await this.getSheetData(config, searchRange)
      
      if (!sheetData || !sheetData.values.length) {
        return null
      }

      console.log('Searching in first 100 rows:', sheetData.values.length, 'rows')

      // Find the row that matches the query criteria
      const matchingRow = this.findMatchingRow(headers, sheetData.values, query)
      
      if (matchingRow) {
        const rowIndex = sheetData.values.indexOf(matchingRow) + 2 // +2 for header row and 1-indexed
        return {
          value: this.extractMetricValue(matchingRow, headers, query.metric || 'ARR'),
          rowData: matchingRow,
          headers: headers,
          rowIndex: rowIndex,
          columnIndex: this.getColumnIndex(headers, query.metric || 'ARR')
        }
      }

      // If not found in first 100 rows, try the next chunk
      console.log('Not found in first 100 rows, searching next chunk...')
      const nextSearchRange = 'A102:Z201'
      const nextSheetData = await this.getSheetData(config, nextSearchRange)
      
      if (nextSheetData && nextSheetData.values.length > 0) {
        const nextMatchingRow = this.findMatchingRow(headers, nextSheetData.values, query)
        
        if (nextMatchingRow) {
          const rowIndex = nextSheetData.values.indexOf(nextMatchingRow) + 102 // +102 for the offset
          return {
            value: this.extractMetricValue(nextMatchingRow, headers, query.metric || 'ARR'),
            rowData: nextMatchingRow,
            headers: headers,
            rowIndex: rowIndex,
            columnIndex: this.getColumnIndex(headers, query.metric || 'ARR')
          }
        }
      }

      // Try a few more chunks if needed
      for (let chunk = 2; chunk <= 10; chunk++) {
        console.log(`Searching chunk ${chunk + 1}...`)
        const chunkStart = chunk * 100 + 2
        const chunkEnd = chunkStart + 99
        const chunkRange = `A${chunkStart}:Z${chunkEnd}`
        
        try {
          const chunkData = await this.getSheetData(config, chunkRange)
          if (chunkData && chunkData.values.length > 0) {
            const chunkMatchingRow = this.findMatchingRow(headers, chunkData.values, query)
            if (chunkMatchingRow) {
              const rowIndex = chunkData.values.indexOf(chunkMatchingRow) + chunkStart
              return {
                value: this.extractMetricValue(chunkMatchingRow, headers, query.metric || 'ARR'),
                rowData: chunkMatchingRow,
                headers: headers,
                rowIndex: rowIndex,
                columnIndex: this.getColumnIndex(headers, query.metric || 'ARR')
              }
            }
          }
        } catch (error) {
          console.log(`Error reading chunk ${chunk + 1}:`, error)
          break
        }
      }

      console.log('Data not found in first 1000 rows')
      return null
    } catch (error) {
      console.error('Error finding data for query:', error)
      return null
    }
  }

  private extractSheetId(url: string): string | null {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
    return match ? match[1] : null
  }

  private findMatchingRow(headers: string[], dataRows: string[][], query: any): string[] | null {
    // Try to find columns that match our query criteria
    const productCol = this.findColumnIndex(headers, ['product', 'product_id', 'product_code'])
    const regionCol = this.findColumnIndex(headers, ['region', 'country', 'market'])
    const segmentCol = this.findColumnIndex(headers, ['segment', 'industry', 'vertical'])
    const periodCol = this.findColumnIndex(headers, ['period', 'quarter', 'time_period', 'fy'])

    console.log('Column indices:', { productCol, regionCol, segmentCol, periodCol })

    // Find the row that matches all criteria
    for (const row of dataRows) {
      let matches = true

      if (query.product && productCol !== -1) {
        const cellValue = row[productCol]?.toString().toLowerCase() || ''
        if (!cellValue.includes(query.product.toLowerCase())) {
          matches = false
        }
      }

      if (query.region && regionCol !== -1) {
        const cellValue = row[regionCol]?.toString().toLowerCase() || ''
        if (!cellValue.includes(query.region.toLowerCase())) {
          matches = false
        }
      }

      if (query.segment && segmentCol !== -1) {
        const cellValue = row[segmentCol]?.toString().toLowerCase() || ''
        if (!cellValue.includes(query.segment.toLowerCase())) {
          matches = false
        }
      }

      if (query.timePeriod && periodCol !== -1) {
        const cellValue = row[periodCol]?.toString().toLowerCase() || ''
        const periodQuery = query.timePeriod.toLowerCase()
        if (!cellValue.includes(periodQuery)) {
          matches = false
        }
      }

      if (matches) {
        console.log('Found matching row:', row)
        return row
      }
    }

    console.log('No matching row found')
    return null
  }

  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase() || ''
      for (const name of possibleNames) {
        if (header.includes(name.toLowerCase())) {
          return i
        }
      }
    }
    return -1
  }

  private extractMetricValue(row: string[], headers: string[], metric: string): number | null {
    // Try to find the metric column
    const metricCol = this.findColumnIndex(headers, [metric.toLowerCase(), 'value', 'amount', 'revenue', 'arr'])
    
    if (metricCol !== -1 && row[metricCol]) {
      const value = parseFloat(row[metricCol].toString().replace(/[,$]/g, ''))
      return isNaN(value) ? null : value
    }

    return null
  }

  private getColumnIndex(headers: string[], metric: string): number {
    return this.findColumnIndex(headers, [metric.toLowerCase(), 'value', 'amount', 'revenue', 'arr'])
  }

  // Test function to verify Google Sheets connection
  async testConnection(config: SheetConfig): Promise<{ success: boolean; message: string; data?: any; errorDetails?: any }> {
    try {
      if (!config.apiKey) {
        return { success: false, message: 'No API key provided' }
      }

      if (!config.sheetsUrl) {
        return { success: false, message: 'No Google Sheets URL provided' }
      }

      const sheetId = this.extractSheetId(config.sheetsUrl)
      if (!sheetId) {
        return { success: false, message: 'Invalid Google Sheets URL format' }
      }

      // Try multiple approaches to connect to the sheet
      // For large sheets, use smaller, more targeted ranges
      const testRanges = [
        'A1:E10', // Small range, just headers and a few rows
        'A1:Z5', // Even smaller range
        'Sheet1!A1:E10', // Explicit Sheet1 with small range
        'Dummy ARR Data!A1:E10', // Actual tab name with small range
        'A1:A10' // Just first column
      ]
      
      let lastError = null
      
      for (const testRange of testRanges) {
        try {
          const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(testRange)}?key=${config.apiKey}`
          
          const response = await fetch(url)
          
          if (response.ok) {
            const data = await response.json()
            const values = data.values || []
            
            return {
              success: true,
              message: `Successfully connected! Found ${values.length} rows of data using range: ${testRange}`,
              data: {
                rowCount: values.length,
                columnCount: values[0]?.length || 0,
                headers: values[0] || [],
                sampleData: values.slice(0, 3), // First 3 rows as sample
                workingRange: testRange
              }
            }
          } else {
            const errorData = await response.json().catch(() => ({}))
            lastError = {
              status: response.status,
              message: errorData.error?.message || response.statusText,
              range: testRange
            }
          }
        } catch (error) {
          lastError = {
            status: 'NETWORK_ERROR',
            message: error instanceof Error ? error.message : 'Network error',
            range: testRange
          }
        }
      }
      
      // If all attempts failed, return the most helpful error message
      if (lastError) {
        let errorMessage = `Connection failed after trying multiple approaches. Last error: ${lastError.message}`
        
        if (lastError.status === 400) {
          if (lastError.message.includes('API key not valid')) {
            errorMessage = `Invalid API Key: Please check your Google Sheets API key. Make sure it's correctly copied and has Google Sheets API enabled.`
          } else if (lastError.message.includes('API key not found')) {
            errorMessage = `API Key Not Found: The API key appears to be empty or incorrectly formatted.`
          } else {
            errorMessage = `Bad Request: ${lastError.message}. This might be due to sheet format issues or permissions.`
          }
        } else if (lastError.status === 403) {
          errorMessage = `Access Forbidden: Your API key doesn't have permission to access Google Sheets. Make sure Google Sheets API is enabled in Google Cloud Console.`
        } else if (lastError.status === 404) {
          errorMessage = `Sheet Not Found: The spreadsheet ID or sheet name doesn't exist. Check your Google Sheets URL.`
        }
        
        return { 
          success: false, 
          message: errorMessage,
          errorDetails: {
            status: lastError.status,
            originalError: lastError.message,
            lastAttemptedRange: lastError.range
          }
        }
      }
      
      // This should never be reached, but just in case
      return { 
        success: false, 
        message: 'Unexpected error: No connection method worked' 
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  // Get all sheet names from the spreadsheet
  async getSheetNames(config: SheetConfig): Promise<string[]> {
    try {
      if (!config.apiKey || !config.sheetsUrl) {
        return []
      }

      const sheetId = this.extractSheetId(config.sheetsUrl)
      if (!sheetId) {
        return []
      }

      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${config.apiKey}`
      const response = await fetch(url)

      if (!response.ok) {
        return []
      }

      const data = await response.json()
      return data.sheets?.map((sheet: any) => sheet.properties?.title) || []
    } catch (error) {
      console.error('Error getting sheet names:', error)
      return []
    }
  }

  // New method for data aggregation and calculations
  async calculateAggregation(
    config: SheetConfig, 
    query: {
      operation: 'sum' | 'average' | 'count' | 'max' | 'min'
      column: string
      filters?: {
        product?: string
        region?: string
        segment?: string
        timePeriod?: string
        dealType?: string
        arrCategory?: string
      }
    }
  ): Promise<{ value: number; details: any; rowCount: number }> {
    
    try {
      console.log('Calculating aggregation:', query)
      
      // Get sheet data
      const sheetData = await this.getSheetData(config)
      if (!sheetData || !sheetData.values.length) {
        return { value: 0, details: {}, rowCount: 0 }
      }

      const headers = sheetData.values[0]
      const rows = sheetData.values.slice(1) // Skip header row
      
      console.log('Headers found:', headers)
      console.log('Total rows:', rows.length)

      // Find the target column
      const targetColumnIndex = this.findColumnIndex(headers, [query.column.toLowerCase(), 'arr_usd', 'value', 'amount'])
      
      if (targetColumnIndex === -1) {
        console.log('Target column not found:', query.column)
        return { value: 0, details: {}, rowCount: 0 }
      }

      // Apply filters and extract values
      const filteredRows = this.applyFilters(rows, headers, query.filters)
      const values = this.extractNumericValues(filteredRows, targetColumnIndex)
      
      console.log('Filtered rows:', filteredRows.length)
      console.log('Extracted values:', values.length)

      // Calculate the aggregation
      let result = 0
      switch (query.operation) {
        case 'sum':
          result = values.reduce((sum, val) => sum + val, 0)
          break
        case 'average':
          result = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
          break
        case 'count':
          result = values.length
          break
        case 'max':
          result = values.length > 0 ? Math.max(...values) : 0
          break
        case 'min':
          result = values.length > 0 ? Math.min(...values) : 0
          break
      }

      console.log('Calculation result:', result)

      return {
        value: result,
        details: {
          operation: query.operation,
          column: query.column,
          filters: query.filters,
          sampleValues: values.slice(0, 5), // First 5 values for debugging
          allValues: values // All values for verification
        },
        rowCount: filteredRows.length
      }

    } catch (error) {
      console.error('Error calculating aggregation:', error)
      return { value: 0, details: { error: error instanceof Error ? error.message : 'Unknown error' }, rowCount: 0 }
    }
  }

  private applyFilters(
    rows: string[][], 
    headers: string[], 
    filters?: {
      product?: string
      region?: string
      segment?: string
      timePeriod?: string
      dealType?: string
      arrCategory?: string
    }
  ): string[][] {
    
    if (!filters) {
      return rows
    }

    return rows.filter(row => {
      // Check product filter
      if (filters.product && filters.product !== 'All Products') {
        const productCol = this.findColumnIndex(headers, ['product'])
        if (productCol !== -1 && !row[productCol]?.toLowerCase().includes(filters.product.toLowerCase())) {
          return false
        }
      }

      // Check region filter
      if (filters.region && filters.region !== 'Global') {
        const regionCol = this.findColumnIndex(headers, ['geo', 'region'])
        if (regionCol !== -1 && !row[regionCol]?.toLowerCase().includes(filters.region.toLowerCase())) {
          return false
        }
      }

      // Check segment filter
      if (filters.segment && filters.segment !== 'All Segments') {
        const segmentCol = this.findColumnIndex(headers, ['industry', 'segment'])
        if (segmentCol !== -1 && !row[segmentCol]?.toLowerCase().includes(filters.segment.toLowerCase())) {
          return false
        }
      }

      // Check time period filter
      if (filters.timePeriod) {
        const timeCol = this.findColumnIndex(headers, ['fiscal_quarter', 'quarter', 'fiscal_year', 'year'])
        if (timeCol !== -1 && !row[timeCol]?.toLowerCase().includes(filters.timePeriod.toLowerCase())) {
          return false
        }
      }

      // Check deal type filter (for "net new")
      if (filters.dealType) {
        const dealTypeCol = this.findColumnIndex(headers, ['deal_type', 'type'])
        if (dealTypeCol !== -1 && !row[dealTypeCol]?.toLowerCase().includes(filters.dealType.toLowerCase())) {
          return false
        }
      }

      // Check ARR category filter (for "platform")
      if (filters.arrCategory) {
        const arrCategoryCol = this.findColumnIndex(headers, ['arr_category', 'category'])
        if (arrCategoryCol !== -1 && !row[arrCategoryCol]?.toLowerCase().includes(filters.arrCategory.toLowerCase())) {
          return false
        }
      }

      return true
    })
  }

  private extractNumericValues(rows: string[][], columnIndex: number): number[] {
    return rows
      .map(row => row[columnIndex])
      .filter(value => value && value !== '')
      .map(value => {
        // Clean the value (remove commas, currency symbols, etc.)
        const cleaned = value.toString().replace(/[,$%]/g, '')
        const num = parseFloat(cleaned)
        return isNaN(num) ? 0 : num
      })
      .filter(num => num > 0) // Only include positive values
  }

  // New method for grouped analysis by category
  async calculateGroupedAnalysis(
    config: SheetConfig,
    query: {
      groupByColumn: string
      valueColumn: string
      filters?: {
        product?: string
        region?: string
        segment?: string
        timePeriod?: string
      }
    }
  ): Promise<{
    groups: Array<{ category: string; value: number }>
    grandTotal: number
    details: any
    rowCount: number
  }> {
    
    try {
      console.log('Calculating grouped analysis:', query)
      
      // Get sheet data
      const sheetData = await this.getSheetData(config)
      if (!sheetData || !sheetData.values.length) {
        return { groups: [], grandTotal: 0, details: {}, rowCount: 0 }
      }

      const headers = sheetData.values[0]
      const rows = sheetData.values.slice(1)
      
      console.log('Headers found:', headers)
      console.log('Total rows:', rows.length)

      // Find the group by column (e.g., arr_category, deal_type)
      const groupByColumnIndex = this.findColumnIndex(headers, [query.groupByColumn.toLowerCase(), 'arr_category', 'deal_type', 'category', 'type'])
      
      // Find the value column (e.g., arr_usd)
      const valueColumnIndex = this.findColumnIndex(headers, [query.valueColumn.toLowerCase(), 'arr_usd', 'value', 'amount'])
      
      if (groupByColumnIndex === -1 || valueColumnIndex === -1) {
        console.log('Required columns not found:', { groupByColumn: query.groupByColumn, valueColumn: query.valueColumn })
        return { groups: [], grandTotal: 0, details: {}, rowCount: 0 }
      }

      // Apply filters
      const filteredRows = this.applyFilters(rows, headers, query.filters)
      
      // Group by category and sum values
      const groupTotals = new Map<string, number>()
      let grandTotal = 0
      
      filteredRows.forEach(row => {
        const category = row[groupByColumnIndex]?.toString().trim() || 'Unknown'
        const value = this.parseNumericValue(row[valueColumnIndex])
        
        if (category && !isNaN(value)) {
          groupTotals.set(category, (groupTotals.get(category) || 0) + value)
          grandTotal += value
        }
      })

      // Convert to array and sort
      const groups = Array.from(groupTotals.entries())
        .map(([category, value]) => ({ category, value }))
        .sort((a, b) => Math.abs(b.value) - Math.abs(a.value)) // Sort by absolute value descending

      console.log('Grouped analysis result:', { groups, grandTotal })

      return {
        groups,
        grandTotal,
        details: {
          groupByColumn: query.groupByColumn,
          valueColumn: query.valueColumn,
          filters: query.filters,
          totalGroups: groups.length
        },
        rowCount: filteredRows.length
      }

    } catch (error) {
      console.error('Error calculating grouped analysis:', error)
      return { groups: [], grandTotal: 0, details: { error: error instanceof Error ? error.message : 'Unknown error' }, rowCount: 0 }
    }
  }

  private parseNumericValue(value: string): number {
    if (!value || value === '') return 0
    
    // Clean the value (remove commas, currency symbols, etc.)
    const cleaned = value.toString().replace(/[,$%]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }
}

// Create a singleton instance
export const googleSheetsService = new GoogleSheetsService()
