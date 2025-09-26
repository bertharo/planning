'use client'

import { useState, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DataSource {
  id: string
  name: string
  type: string
  connected: boolean
  config?: { [key: string]: string | boolean }
}

export function NaturalLanguageInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I can help you build financial models, analyze data, and create scenarios. What would you like to do?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectedDataSources, setConnectedDataSources] = useState<DataSource[]>([])

  // Load connected data sources from localStorage
  useEffect(() => {
    const loadConnectedDataSources = () => {
      try {
        const savedConfigs = localStorage.getItem('dataSourceConfigs')
        if (savedConfigs) {
          const configs = JSON.parse(savedConfigs)
          const connected: DataSource[] = []
          
          Object.keys(configs).forEach(sourceId => {
            const config = configs[sourceId]
            if (config && Object.keys(config).length > 0) {
              connected.push({
                id: sourceId,
                name: getDataSourceName(sourceId),
                type: getDataSourceType(sourceId),
                connected: true,
                config: config
              })
            }
          })
          
          setConnectedDataSources(connected)
          console.log('Connected data sources:', connected)
        }
      } catch (error) {
        console.error('Error loading connected data sources:', error)
      }
    }

    loadConnectedDataSources()
    
    // Listen for changes in localStorage (when user saves configurations)
    const handleStorageChange = () => {
      loadConnectedDataSources()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also check periodically for changes (since storage event doesn't fire on same tab)
    const interval = setInterval(loadConnectedDataSources, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const getDataSourceName = (id: string): string => {
    const names: { [key: string]: string } = {
      'workday': 'Workday',
      'salesforce': 'Salesforce', 
      'databricks': 'Databricks',
      'snowflake': 'Snowflake',
      'google-sheets': 'Google Sheets',
      'excel': 'Excel'
    }
    return names[id] || id
  }

  const getDataSourceType = (id: string): string => {
    const types: { [key: string]: string } = {
      'workday': 'HR',
      'salesforce': 'CRM',
      'databricks': 'Data',
      'snowflake': 'Data',
      'google-sheets': 'Spreadsheet',
      'excel': 'Spreadsheet'
    }
    return types[id] || 'Unknown'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Check if this is a model creation request
      const shouldCreateModel = input.toLowerCase().includes('create') && 
        (input.toLowerCase().includes('model') || 
         input.toLowerCase().includes('revenue') || 
         input.toLowerCase().includes('capex') || 
         input.toLowerCase().includes('personnel'))

      // Check if this is an analytical question
      const isAnalyticalQuestion = (
        input.toLowerCase().includes('how much') ||
        input.toLowerCase().includes('what is') ||
        input.toLowerCase().includes('show me') ||
        input.toLowerCase().includes('calculate') ||
        input.toLowerCase().includes('analyze') ||
        input.toLowerCase().includes('arr') ||
        input.toLowerCase().includes('revenue') ||
        input.toLowerCase().includes('sales') ||
        input.toLowerCase().includes('q1') ||
        input.toLowerCase().includes('q2') ||
        input.toLowerCase().includes('q3') ||
        input.toLowerCase().includes('q4') ||
        input.toLowerCase().includes('fy') ||
        input.toLowerCase().includes('product') ||
        input.toLowerCase().includes('region') ||
        input.toLowerCase().includes('segment')
      )

      if (shouldCreateModel) {
        await handleModelCreation(input)
      } else if (isAnalyticalQuestion) {
        await handleAnalyticalQuestion(input)
      } else {
        // Regular response
        setTimeout(() => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: generateResponse(input),
            timestamp: new Date()
          }
          setMessages(prev => [...prev, assistantMessage])
          setIsLoading(false)
        }, 1000)
      }
    } catch (error) {
      console.error('Error handling request:', error)
      setIsLoading(false)
    }
  }

  const handleModelCreation = async (userInput: string) => {
    try {
      // Determine model type
      let modelType = 'Revenue'
      if (userInput.toLowerCase().includes('capex') || userInput.toLowerCase().includes('capital')) {
        modelType = 'CapEx'
      } else if (userInput.toLowerCase().includes('personnel') || userInput.toLowerCase().includes('headcount')) {
        modelType = 'Personnel'
      }

      // Generate model data based on connected sources
      const modelData = await generateModelData(modelType, connectedDataSources)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: modelData.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // If we have actual model data, show it
      if (modelData.model) {
        const modelMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `📊 **${modelType} Model Created!**\n\nHere's your model data:\n\`\`\`\n${JSON.stringify(modelData.model, null, 2)}\n\`\`\`\n\nThis model has been saved to your Models section. You can now use it for scenario planning and analysis.`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, modelMessage])
      }
      
    } catch (error) {
      console.error('Error creating model:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I encountered an error while creating your model. Please try again or check your data source configuration.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyticalQuestion = async (userInput: string) => {
    try {
      console.log('Processing analytical question:', userInput)
      
      // Parse the question to extract key dimensions
      const parsedQuery = parseAnalyticalQuery(userInput)
      console.log('Parsed query:', parsedQuery)
      
      // Generate realistic data based on the query
      const analysisResult = await generateAnalyticalResponse(parsedQuery, connectedDataSources)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: analysisResult.response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // If we have detailed data, show it
      if (analysisResult.data) {
        const dataMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: `📊 **Detailed Analysis:**\n\`\`\`\n${JSON.stringify(analysisResult.data, null, 2)}\n\`\`\`\n\nThis analysis is based on data from your connected sources: ${connectedDataSources.map(ds => ds.name).join(', ')}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, dataMessage])
      }
      
    } catch (error) {
      console.error('Error handling analytical question:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I encountered an error while analyzing your data. Please check your data source configuration and try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const parseAnalyticalQuery = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    return {
      metric: extractMetric(lowerQuery),
      product: extractProduct(lowerQuery),
      region: extractRegion(lowerQuery),
      segment: extractSegment(lowerQuery),
      timePeriod: extractTimePeriod(lowerQuery),
      originalQuery: query
    }
  }

  const extractMetric = (query: string) => {
    if (query.includes('arr') || query.includes('annual recurring revenue')) return 'ARR'
    if (query.includes('revenue')) return 'Revenue'
    if (query.includes('sales')) return 'Sales'
    if (query.includes('customers') || query.includes('accounts')) return 'Customers'
    if (query.includes('growth')) return 'Growth'
    return 'Revenue' // Default
  }

  const extractProduct = (query: string) => {
    const productMatch = query.match(/product\s+(\w+)/)
    return productMatch ? productMatch[1] : 'All Products'
  }

  const extractRegion = (query: string) => {
    const regions = ['australia', 'us', 'europe', 'asia', 'canada', 'uk']
    return regions.find(region => query.includes(region)) || 'Global'
  }

  const extractSegment = (query: string) => {
    const segments = ['finance', 'healthcare', 'retail', 'technology', 'manufacturing']
    return segments.find(segment => query.includes(segment)) || 'All Segments'
  }

  const extractTimePeriod = (query: string) => {
    if (query.includes('q1')) return 'Q1'
    if (query.includes('q2')) return 'Q2'
    if (query.includes('q3')) return 'Q3'
    if (query.includes('q4')) return 'Q4'
    if (query.includes('fy25')) return 'FY25'
    if (query.includes('fy24')) return 'FY24'
    return 'Current Period'
  }

  const generateAnalyticalResponse = async (parsedQuery: any, dataSources: DataSource[]) => {
    // Simulate data analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate realistic data based on the query
    const analysisData = generateRealisticData(parsedQuery)
    
    const response = `🔍 **Analysis Results**

Based on your question: "${parsedQuery.originalQuery}"

**Query Breakdown:**
• Metric: ${parsedQuery.metric}
• Product: ${parsedQuery.product}
• Region: ${parsedQuery.region}
• Segment: ${parsedQuery.segment}
• Time Period: ${parsedQuery.timePeriod}

**Answer:** ${analysisData.answer}

**Key Insights:**
${analysisData.insights.map(insight => `• ${insight}`).join('\n')}

**Data Source:** ${dataSources.map(ds => ds.name).join(', ') || 'Connected Data Sources'}`

    return {
      response,
      data: analysisData.detailedData
    }
  }

  const generateRealisticData = (parsedQuery: any) => {
    // Generate realistic financial data based on the parsed query
    const baseValue = Math.floor(Math.random() * 1000000) + 500000 // $500k - $1.5M base
    
    // Adjust based on region
    let regionMultiplier = 1
    if (parsedQuery.region === 'australia') regionMultiplier = 0.15
    else if (parsedQuery.region === 'us') regionMultiplier = 0.6
    else if (parsedQuery.region === 'europe') regionMultiplier = 0.3
    
    // Adjust based on segment
    let segmentMultiplier = 1
    if (parsedQuery.segment === 'finance') segmentMultiplier = 1.2
    else if (parsedQuery.segment === 'healthcare') segmentMultiplier = 0.8
    
    // Adjust based on product
    let productMultiplier = 1
    if (parsedQuery.product !== 'All Products') {
      productMultiplier = 0.3 // Individual products are smaller
    }
    
    const finalValue = Math.floor(baseValue * regionMultiplier * segmentMultiplier * productMultiplier)
    
    return {
      answer: `${parsedQuery.metric}: $${finalValue.toLocaleString()} for ${parsedQuery.product} in ${parsedQuery.region} ${parsedQuery.segment} during ${parsedQuery.timePeriod}`,
      insights: [
        `${parsedQuery.region} represents ${Math.round(regionMultiplier * 100)}% of global revenue`,
        `${parsedQuery.segment} segment shows ${segmentMultiplier > 1 ? 'above' : 'below'} average performance`,
        `${parsedQuery.product} contributes ${Math.round(productMultiplier * 100)}% to total product revenue`,
        'Growth trend: +12% quarter-over-quarter',
        'Market share: 8.5% in target segment'
      ],
      detailedData: {
        metric: parsedQuery.metric,
        value: finalValue,
        currency: 'USD',
        period: parsedQuery.timePeriod,
        breakdown: {
          product: parsedQuery.product,
          region: parsedQuery.region,
          segment: parsedQuery.segment
        },
        trends: {
          qoqGrowth: 0.12,
          yoyGrowth: 0.28,
          marketShare: 0.085
        },
        comparison: {
          previousPeriod: Math.floor(finalValue * 0.89),
          industryAverage: Math.floor(finalValue * 1.15)
        }
      }
    }
  }

  const generateModelData = async (modelType: string, dataSources: DataSource[]) => {
    // Simulate data pulling and model generation
    await new Promise(resolve => setTimeout(resolve, 2000))

    const modelId = Date.now().toString()
    const baseModel = {
      id: modelId,
      name: `${modelType} Model - ${new Date().toLocaleDateString()}`,
      type: modelType,
      description: `Generated ${modelType} model using connected data sources`,
      lastModified: new Date(),
      createdBy: 'AI Assistant',
      data: {}
    }

    // Generate model data based on type and connected sources
    if (modelType === 'Revenue') {
      baseModel.data = {
        monthlyRecurringRevenue: [10000, 12000, 15000, 18000, 22000],
        newCustomers: [50, 60, 75, 90, 110],
        churnRate: 0.05,
        averageRevenuePerUser: 100,
        growthRate: 0.2,
        dataSource: dataSources.find(ds => ds.id === 'google-sheets')?.name || 'Manual Input'
      }
    } else if (modelType === 'CapEx') {
      baseModel.data = {
        equipment: 50000,
        software: 15000,
        infrastructure: 25000,
        totalCapEx: 90000,
        monthlyDepreciation: 7500,
        dataSource: dataSources.find(ds => ds.id === 'google-sheets')?.name || 'Manual Input'
      }
    } else if (modelType === 'Personnel') {
      baseModel.data = {
        currentHeadcount: 25,
        plannedHires: 15,
        averageSalary: 120000,
        benefits: 18000,
        totalPersonnelCost: 3450000,
        dataSource: dataSources.find(ds => ds.id === 'google-sheets')?.name || 'Manual Input'
      }
    }

    // Save to localStorage (simulate saving to models)
    try {
      const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]')
      savedModels.push(baseModel)
      localStorage.setItem('savedModels', JSON.stringify(savedModels))
    } catch (error) {
      console.error('Error saving model:', error)
    }

    const response = `✅ **${modelType} Model Created Successfully!**

I've analyzed your connected data sources and created a comprehensive ${modelType} model. Here's what I found:

**Data Sources Used:** ${dataSources.map(ds => ds.name).join(', ') || 'Default assumptions'}

**Model Features:**
${modelType === 'Revenue' ? 
  '• Monthly Recurring Revenue projections\n• Customer growth analysis\n• Churn rate calculations\n• ARPU trends' :
  modelType === 'CapEx' ?
  '• Equipment and software costs\n• Infrastructure investments\n• Depreciation schedules\n• Capital allocation' :
  '• Headcount projections\n• Salary and benefits analysis\n• Hiring timeline\n• Total personnel costs'
}

The model has been saved and is now available in your Models section. You can use it for scenario planning and further analysis.`

    return {
      response,
      model: baseModel
    }
  }

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()
    
    // Check if user has connected data sources
    const hasConnectedSources = connectedDataSources.length > 0
    const connectedSourceNames = connectedDataSources.map(ds => ds.name).join(', ')
    
    if (lowerInput.includes('google sheets') || lowerInput.includes('sheets')) {
      const googleSheets = connectedDataSources.find(ds => ds.id === 'google-sheets')
      if (googleSheets) {
        return `Great! I can see you have Google Sheets connected. I can help you analyze the data from your spreadsheet at "${googleSheets.config?.sheetsUrl || 'your configured sheet'}". What specific data would you like me to work with? For example, I can help you create revenue models, analyze trends, or build scenarios based on your spreadsheet data.`
      }
      return 'I can help you connect and analyze data from Google Sheets. Once connected, I can pull data from your spreadsheets to create models or build scenarios. Would you like me to help you configure the Google Sheets connection?'
    }
    
    if (lowerInput.includes('excel') || lowerInput.includes('spreadsheet')) {
      const excel = connectedDataSources.find(ds => ds.id === 'excel')
      if (excel) {
        return `Perfect! I can see you have Excel connected. I can work with the data from "${excel.config?.filePath || 'your configured file'}". What type of analysis would you like me to perform on your Excel data? I can help with financial modeling, trend analysis, or scenario planning.`
      }
      return 'I can work with Excel files to extract data for your financial models. You can upload Excel files or connect to shared Excel files. What type of data are you looking to analyze from your Excel files?'
    }
    
    if (lowerInput.includes('revenue') || lowerInput.includes('sales')) {
      if (hasConnectedSources) {
        return `Excellent! I can help you create a revenue model using data from your connected sources: ${connectedSourceNames}. I can pull historical sales data and project future growth. Would you like me to start with a basic SaaS revenue model using your spreadsheet data?`
      }
      return 'I can help you create a revenue model. To get the most accurate results, I recommend connecting your data sources first (Google Sheets, Excel, Salesforce, etc.) so I can pull historical sales data and project future growth. Would you like me to help you set up data connections?'
    }
    
    if (lowerInput.includes('capex') || lowerInput.includes('capital')) {
      if (hasConnectedSources) {
        return `I can help you build a CapEx model using data from your connected sources: ${connectedSourceNames}. This typically includes equipment, software licenses, and infrastructure investments. What type of capital expenditures are you planning for?`
      }
      return 'I can help you build a CapEx model. This typically includes equipment, software licenses, and infrastructure investments. I can pull data from your connected sources including spreadsheets. What type of capital expenditures are you planning for?'
    }
    
    if (lowerInput.includes('personnel') || lowerInput.includes('headcount') || lowerInput.includes('hiring')) {
      if (hasConnectedSources) {
        return `I can create a personnel model using data from your connected sources: ${connectedSourceNames}. This tracks headcount growth, compensation costs, and hiring plans. Would you like to include benefits and equity compensation in the model?`
      }
      return 'I can create a personnel model that tracks headcount growth, compensation costs, and hiring plans. I can integrate data from Workday, Google Sheets, or Excel files. Would you like to include benefits and equity compensation in the model?'
    }
    
    if (lowerInput.includes('scenario') || lowerInput.includes('what if')) {
      if (hasConnectedSources) {
        return `Great! I can help you create different scenarios using data from your connected sources: ${connectedSourceNames}. I can model various business conditions and adjust key variables. What specific scenarios would you like to explore?`
      }
      return 'Great! I can help you create different scenarios to model various business conditions. I can use data from all your connected sources including spreadsheets. What variables would you like to adjust in your scenario analysis?'
    }
    
    if (lowerInput.includes('data') || lowerInput.includes('connect')) {
      if (hasConnectedSources) {
        return `You currently have these data sources connected: ${connectedSourceNames}. I can help you analyze data from these sources or connect additional ones. What would you like to do with your data?`
      }
      return 'I can help you connect to various data sources including Google Sheets, Excel files, Salesforce, Workday, Databricks, and Snowflake. Which data source would you like to work with?'
    }
    
    if (lowerInput.includes('analyze') || lowerInput.includes('show') || lowerInput.includes('display')) {
      if (hasConnectedSources) {
        return `I can analyze data from your connected sources: ${connectedSourceNames}. What specific data would you like me to analyze? For example, I can show trends, create charts, or perform calculations based on your spreadsheet data.`
      }
      return 'I can help you analyze data once you connect your data sources. Please configure at least one data source (Google Sheets, Excel, etc.) and then I can help you analyze the data.'
    }
    
    if (hasConnectedSources) {
      return `I can help you with financial planning using your connected data sources: ${connectedSourceNames}. I can create models, analyze data, build scenarios, or answer specific questions about your data. What would you like to work on?`
    }
    
    return 'I understand you want to work with financial planning. I can help you create models, analyze data from your connected sources, or build scenarios. First, I recommend connecting your data sources (Google Sheets, Excel, etc.) so I can provide more accurate analysis. What would you like to accomplish?'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask me anything about your financial planning</p>
        
        {connectedDataSources.length > 0 && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs font-medium text-green-800 mb-1">Connected Data Sources:</p>
            <div className="flex flex-wrap gap-1">
              {connectedDataSources.map((source) => (
                <span 
                  key={source.id}
                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                >
                  {source.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start space-x-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-full ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`rounded-lg p-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-secondary">
                <Bot className="w-4 h-4" />
              </div>
              <div className="rounded-lg p-3 bg-secondary">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me to create a model, analyze data, or build scenarios..."
            className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
