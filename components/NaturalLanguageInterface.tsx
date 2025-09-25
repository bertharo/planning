'use client'

import { useState } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
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
    
    if (lowerInput.includes('google sheets') || lowerInput.includes('sheets')) {
      return 'I can help you connect and analyze data from Google Sheets. Once connected, I can pull data from your spreadsheets to create models or build scenarios. Would you like me to help you configure the Google Sheets connection?'
    }
    
    if (lowerInput.includes('excel') || lowerInput.includes('spreadsheet')) {
      return 'I can work with Excel files to extract data for your financial models. You can upload Excel files or connect to shared Excel files. What type of data are you looking to analyze from your Excel files?'
    }
    
    if (lowerInput.includes('revenue') || lowerInput.includes('sales')) {
      return 'I can help you create a revenue model. Based on your data sources (including Google Sheets, Excel, Salesforce, etc.), I can pull historical sales data and project future growth. Would you like me to start with a basic SaaS revenue model?'
    }
    
    if (lowerInput.includes('capex') || lowerInput.includes('capital')) {
      return 'I can help you build a CapEx model. This typically includes equipment, software licenses, and infrastructure investments. I can pull data from your connected sources including spreadsheets. What type of capital expenditures are you planning for?'
    }
    
    if (lowerInput.includes('personnel') || lowerInput.includes('headcount') || lowerInput.includes('hiring')) {
      return 'I can create a personnel model that tracks headcount growth, compensation costs, and hiring plans. I can integrate data from Workday, Google Sheets, or Excel files. Would you like to include benefits and equity compensation in the model?'
    }
    
    if (lowerInput.includes('scenario') || lowerInput.includes('what if')) {
      return 'Great! I can help you create different scenarios to model various business conditions. I can use data from all your connected sources including spreadsheets. What variables would you like to adjust in your scenario analysis?'
    }
    
    if (lowerInput.includes('data') || lowerInput.includes('connect')) {
      return 'I can help you connect to various data sources including Google Sheets, Excel files, Salesforce, Workday, Databricks, and Snowflake. Which data source would you like to work with?'
    }
    
    return 'I understand you want to work with financial planning. I can help you create models, analyze data from your connected sources (including Google Sheets and Excel), or build scenarios. Could you be more specific about what you\'d like to accomplish?'
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <p className="text-sm text-muted-foreground">Ask me anything about your financial planning</p>
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
