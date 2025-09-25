'use client'

import { useState } from 'react'
import { 
  Database, 
  Users, 
  TrendingUp, 
  Snowflake,
  FileSpreadsheet,
  FileText,
  Settings,
  Plus,
  Check,
  X
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
  connected: boolean
}

interface DataSourcePanelProps {
  dataSources: DataSource[]
  setDataSources: (sources: DataSource[]) => void
}

const dataSourceIcons = {
  workday: Users,
  salesforce: TrendingUp,
  databricks: Database,
  snowflake: Snowflake,
  'google-sheets': FileSpreadsheet,
  excel: FileText,
}

export function DataSourcePanel({ dataSources, setDataSources }: DataSourcePanelProps) {
  const [showConfig, setShowConfig] = useState<string | null>(null)

  const toggleConnection = (id: string) => {
    setDataSources(
      dataSources.map(source => 
        source.id === id 
          ? { ...source, connected: !source.connected }
          : source
      )
    )
  }

  const toggleConfig = (id: string) => {
    setShowConfig(showConfig === id ? null : id)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Data Sources</h2>
          <button className="p-2 hover:bg-accent rounded-md">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {dataSources.map((source) => {
          const Icon = dataSourceIcons[source.id as keyof typeof dataSourceIcons]
          
          return (
            <div key={source.id} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-secondary rounded-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{source.name}</h3>
                    <p className="text-sm text-muted-foreground">{source.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleConfig(source.id)}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => toggleConnection(source.id)}
                    className={`p-1 rounded transition-colors ${
                      source.connected 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-accent'
                    }`}
                  >
                    {source.connected ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {showConfig === source.id && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="space-y-2">
                    {source.id === 'google-sheets' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Google Sheets URL
                          </label>
                          <input
                            type="url"
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sheet Name
                          </label>
                          <input
                            type="text"
                            placeholder="Sheet1, Data, etc."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Google API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter Google API key..."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="auto-refresh"
                            className="rounded"
                          />
                          <label htmlFor="auto-refresh" className="text-sm">
                            Auto-refresh data every hour
                          </label>
                        </div>
                      </>
                    )}
                    
                    {source.id === 'excel' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Excel File Path
                          </label>
                          <input
                            type="text"
                            placeholder="/path/to/file.xlsx or URL"
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sheet Name
                          </label>
                          <input
                            type="text"
                            placeholder="Sheet1, Data, etc."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Data Range
                          </label>
                          <input
                            type="text"
                            placeholder="A1:Z100 or leave blank for auto-detect"
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="header-row"
                            className="rounded"
                            defaultChecked
                          />
                          <label htmlFor="header-row" className="text-sm">
                            First row contains headers
                          </label>
                        </div>
                      </>
                    )}
                    
                    {(source.id !== 'google-sheets' && source.id !== 'excel') && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Connection String
                          </label>
                          <input
                            type="text"
                            placeholder="Enter connection details..."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter API key..."
                            className="w-full px-3 py-2 border border-input rounded-md text-sm"
                          />
                        </div>
                      </>
                    )}
                    
                    <button className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90">
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
