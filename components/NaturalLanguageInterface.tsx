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

    // Simulate AI response
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
