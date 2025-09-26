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
      // For large sheets, we'll search in the first 500 rows first
      const searchRange = 'A2:Z501' // Skip header, search first 500 data rows
      const sheetData = await this.getSheetData(config, searchRange)
      
      if (!sheetData || !sheetData.values.length) {
        return null
      }

      console.log('Searching in first 500 rows:', sheetData.values.length, 'rows')

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

      // If not found in first 500 rows, try the next chunk
      console.log('Not found in first 500 rows, searching next chunk...')
      const nextSearchRange = 'A502:Z1001'
      const nextSheetData = await this.getSheetData(config, nextSearchRange)
      
      if (nextSheetData && nextSheetData.values.length > 0) {
        const nextMatchingRow = this.findMatchingRow(headers, nextSheetData.values, query)
        
        if (nextMatchingRow) {
          const rowIndex = nextSheetData.values.indexOf(nextMatchingRow) + 502 // +502 for the offset
          return {
            value: this.extractMetricValue(nextMatchingRow, headers, query.metric || 'ARR'),
            rowData: nextMatchingRow,
            headers: headers,
            rowIndex: rowIndex,
            columnIndex: this.getColumnIndex(headers, query.metric || 'ARR')
          }
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
}

// Create a singleton instance
export const googleSheetsService = new GoogleSheetsService()
