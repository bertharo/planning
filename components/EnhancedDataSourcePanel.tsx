'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, ExternalLink, Settings, Zap, Database, FileSpreadsheet, Users, BarChart3, Cloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface DataSource {
  id: string
  name: string
  type: string
  connected: boolean
  config?: { [key: string]: any }
  lastSync?: Date
  recordCount?: number
  status?: 'active' | 'error' | 'syncing'
}

export function EnhancedDataSourcePanel() {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    { id: 'workday', name: 'Workday', type: 'HR', connected: false },
    { id: 'salesforce', name: 'Salesforce', type: 'CRM', connected: false },
    { id: 'databricks', name: 'Databricks', type: 'Data', connected: false },
    { id: 'snowflake', name: 'Snowflake', type: 'Data', connected: false },
    { id: 'google-sheets', name: 'Google Sheets', type: 'Spreadsheet', connected: false },
    { id: 'excel', name: 'Excel', type: 'Spreadsheet', connected: false },
  ])

  const [isConfiguring, setIsConfiguring] = useState<string | null>(null)

  // Load configuration from localStorage
  useEffect(() => {
    const loadConfigurations = () => {
      if (typeof window === 'undefined') return
      
      try {
        const savedConfigs = localStorage.getItem('dataSourceConfigs')
        if (savedConfigs) {
          const configs = JSON.parse(savedConfigs)
          setDataSources(prev => prev.map(source => ({
            ...source,
            connected: !!(configs[source.id] && Object.keys(configs[source.id]).length > 0),
            config: configs[source.id] || {},
            lastSync: configs[source.id]?.lastSync ? new Date(configs[source.id].lastSync) : undefined,
            recordCount: configs[source.id]?.recordCount || undefined,
            status: configs[source.id]?.status || 'active'
          })))
        }
      } catch (error) {
        console.error('Error loading configurations:', error)
      }
    }

    loadConfigurations()
    
    const handleStorageChange = () => {
      loadConfigurations()
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(loadConfigurations, 2000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HR': return Users
      case 'CRM': return BarChart3
      case 'Data': return Database
      case 'Spreadsheet': return FileSpreadsheet
      default: return Cloud
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'HR': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CRM': return 'bg-green-100 text-green-700 border-green-200'
      case 'Data': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Spreadsheet': return 'bg-orange-100 text-orange-700 border-orange-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const handleConnect = (sourceId: string) => {
    setIsConfiguring(sourceId)
    
    // Simulate configuration process
    setTimeout(() => {
      const newConfig = {
        [sourceId]: {
          connected: true,
          lastSync: new Date().toISOString(),
          recordCount: Math.floor(Math.random() * 10000) + 1000,
          status: 'active'
        }
      }
      
      const existingConfigs = JSON.parse(localStorage.getItem('dataSourceConfigs') || '{}')
      const updatedConfigs = { ...existingConfigs, ...newConfig }
      localStorage.setItem('dataSourceConfigs', JSON.stringify(updatedConfigs))
      
      setDataSources(prev => prev.map(source => 
        source.id === sourceId 
          ? { 
              ...source, 
              connected: true, 
              config: newConfig[sourceId],
              lastSync: new Date(),
              recordCount: newConfig[sourceId].recordCount,
              status: 'active'
            }
          : source
      ))
      
      setIsConfiguring(null)
    }, 2000)
  }

  const handleDisconnect = (sourceId: string) => {
    const existingConfigs = JSON.parse(localStorage.getItem('dataSourceConfigs') || '{}')
    delete existingConfigs[sourceId]
    localStorage.setItem('dataSourceConfigs', JSON.stringify(existingConfigs))
    
    setDataSources(prev => prev.map(source => 
      source.id === sourceId 
        ? { ...source, connected: false, config: {}, lastSync: undefined, recordCount: undefined, status: 'active' }
        : source
    ))
  }

  const connectedCount = dataSources.filter(source => source.connected).length
  const totalCount = dataSources.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <CardTitle className="flex items-center space-x-2 mb-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span>Data Sources</span>
        </CardTitle>
        <CardDescription>
          Connect your data sources to enable AI-powered insights
        </CardDescription>
      </div>

      {/* Connection Status */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connection Status</h3>
                <p className="text-sm text-gray-600">
                  {connectedCount} of {totalCount} sources connected
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((connectedCount / totalCount) * 100)}%
              </div>
              <Progress value={(connectedCount / totalCount) * 100} className="w-20 h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources List */}
      <div className="space-y-3">
        {dataSources.map((source) => {
          const TypeIcon = getTypeIcon(source.type)
          const isCurrentlyConfiguring = isConfiguring === source.id
          
          return (
            <Card key={source.id} className={`transition-all duration-200 ${
              source.connected ? 'border-green-200 bg-green-50' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      source.connected ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <TypeIcon className={`h-5 w-5 ${
                        source.connected ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        <Badge className={`text-xs ${getTypeColor(source.type)}`}>
                          {source.type}
                        </Badge>
                        {source.connected && (
                          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      
                      {source.connected && source.recordCount && (
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>{source.recordCount.toLocaleString()} records</span>
                          {source.lastSync && (
                            <span>Last sync: {source.lastSync.toLocaleDateString()}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {source.connected ? (
                      <>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDisconnect(source.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                        <Button 
                          onClick={() => handleConnect(source.id)}
                          disabled={isCurrentlyConfiguring}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isCurrentlyConfiguring ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Circle className="h-4 w-4 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {isCurrentlyConfiguring && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-700">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Setting up connection...</span>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      This may take a few moments while we establish the connection.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Integration Guide
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Manage All Connections
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
