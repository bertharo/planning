'use client'

import { useState, useEffect } from 'react'
import { Send, Bot, User, Sparkles, TrendingUp, BarChart3, GitBranch, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

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

export function EnhancedNaturalLanguageInterface() {
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

  // Sample suggestions inspired by Pigment's interface
  const suggestions = [
    {
      icon: TrendingUp,
      title: 'Increase ARR by $15M',
      description: 'Create a revenue growth scenario',
      prompt: 'Increase total ARR by $15M; EMEA ≤ $2M'
    },
    {
      icon: BarChart3,
      title: 'Hire 20 engineers',
      description: 'Plan workforce expansion',
      prompt: 'Hire 20 engineers for product development'
    },
    {
      icon: GitBranch,
      title: 'Reduce churn by 5%',
      description: 'Improve customer retention',
      prompt: 'Reduce churn by 5% across all products'
    },
    {
      icon: Lightbulb,
      title: 'Optimize pricing',
      description: 'Analyze pricing strategy',
      prompt: 'Increase pricing by 10% for enterprise customers'
    }
  ]

  // Load connected data sources from localStorage
  useEffect(() => {
    const loadConnectedDataSources = () => {
      if (typeof window === 'undefined') return
      
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
        }
      } catch (error) {
        console.error('Error loading connected data sources:', error)
      }
    }

    loadConnectedDataSources()
    
    const handleStorageChange = () => {
      loadConnectedDataSources()
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(loadConnectedDataSources, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const getDataSourceName = (id: string) => {
    const names: { [key: string]: string } = {
      'workday': 'Workday',
      'salesforce': 'Salesforce',
      'databricks': 'Databricks',
      'snowflake': 'Snowflake',
      'google-sheets': 'Google Sheets',
      'excel': 'Excel'
    }
    return names[id] || 'Unknown'
  }

  const getDataSourceType = (id: string) => {
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
    }, 1500)
  }

  const generateResponse = (userInput: string) => {
    // Simple response generation - in real app, this would call your AI service
    const responses = [
      "I've analyzed your request and created a comprehensive scenario. The model shows significant potential for growth with the proposed changes.",
      "Based on your data sources, I can see this scenario aligns well with your current trajectory. Let me run some additional analysis.",
      "This is an interesting scenario! I've identified several key factors that could impact the outcome. Would you like me to explore specific aspects?",
      "I've processed your request and generated a detailed analysis. The results show promising opportunities for optimization."
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span>AI Planning Assistant</span>
        </CardTitle>
        <CardDescription>
          Ask questions, create scenarios, or get insights about your financial data
        </CardDescription>
      </CardHeader>

      {/* Connected Sources */}
      {connectedDataSources.length > 0 && (
        <div className="px-6 pb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Connected Sources</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {connectedDataSources.map((source) => (
              <Badge key={source.id} variant="secondary" className="text-xs">
                {source.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user'
                    ? 'bg-blue-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-2 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Suggestions */}
      <div className="px-6 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 justify-start text-left hover:bg-blue-50 hover:border-blue-200"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3">
                  <Icon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{suggestion.title}</div>
                  <div className="text-xs text-gray-500">{suggestion.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Input */}
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your financial planning..."
              className="min-h-[80px] resize-none pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className="absolute bottom-2 right-2 h-8 w-8 p-0"
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>Powered by AI</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
