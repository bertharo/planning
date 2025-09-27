'use client'

import { useState, useEffect } from 'react'
import { googleSheetsService } from '@/lib/googleSheets'
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
  X,
  Save,
  AlertCircle,
  TestTube
} from 'lucide-react'

interface DataSource {
  id: string
  name: string
  type: string
  connected: boolean
  config?: DataSourceConfig
}

interface DataSourceConfig {
  [key: string]: string | boolean
}

// Helper function to get string value from config
const getStringValue = (value: string | boolean | undefined): string => {
  if (typeof value === 'boolean') return value.toString()
  return value || ''
}

// Helper function to get boolean value from config
const getBooleanValue = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

interface DataSourcePanelProps {
  dataSources: DataSource[]
  setDataSources: React.Dispatch<React.SetStateAction<DataSource[]>>
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
  const [configForm, setConfigForm] = useState<DataSourceConfig>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null)

  // Load saved configurations from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedConfigs = localStorage.getItem('dataSourceConfigs')
    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs)
        setDataSources((prev: DataSource[]) => 
          prev.map(source => ({
            ...source,
            config: configs[source.id] || source.config,
            connected: configs[source.id] ? Object.keys(configs[source.id]).length > 0 : source.connected
          }))
        )
      } catch (error) {
        console.error('Error loading saved configurations:', error)
      }
    }
  }, [setDataSources])

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
    if (showConfig === id) {
      setShowConfig(null)
      setConfigForm({})
    } else {
      setShowConfig(id)
      // Load existing config if available
      const source = dataSources.find(s => s.id === id)
      setConfigForm(source?.config || {})
    }
    setSaveStatus('idle')
  }

  const updateConfigForm = (key: string, value: string | boolean) => {
    setConfigForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveConfiguration = async (sourceId: string) => {
    console.log('Save button clicked for:', sourceId)
    console.log('Current config form:', configForm)
    
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      console.error('localStorage not available')
      setSaveStatus('error')
      return
    }

    // Validate that we have some configuration data
    if (Object.keys(configForm).length === 0) {
      console.warn('No configuration data to save')
      setSaveStatus('error')
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      console.log('Starting save process...')
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Save to localStorage
      const savedConfigs = JSON.parse(localStorage.getItem('dataSourceConfigs') || '{}')
      savedConfigs[sourceId] = configForm
      localStorage.setItem('dataSourceConfigs', JSON.stringify(savedConfigs))
      
      console.log('Saved to localStorage:', savedConfigs)

      // Update the data source
      setDataSources((prev: DataSource[]) =>
        prev.map(source =>
          source.id === sourceId
            ? {
                ...source,
                config: configForm,
                connected: Object.keys(configForm).length > 0
              }
            : source
        )
      )

      console.log('Updated data sources state')
      setSaveStatus('success')
      
      setTimeout(() => {
        setShowConfig(null)
        setConfigForm({})
        setSaveStatus('idle')
      }, 1500)
    } catch (error) {
      console.error('Error saving configuration:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const testConnection = async (sourceId: string) => {
    if (sourceId !== 'google-sheets') {
      setTestResult({ success: false, message: 'Test connection only available for Google Sheets' })
      return
    }

    setIsTestingConnection(true)
    setTestResult(null)

    try {
      const result = await googleSheetsService.testConnection(configForm)
      setTestResult(result)
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="h-full flex flex-col max-h-screen lg:max-h-none bg-gradient-to-b from-muted to-card">
      <div className="p-4 lg:p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-fg">Data Sources</h2>
              <p className="text-sm text-fgMuted">Connect and configure your financial data sources</p>
            </div>
          </div>
          <button className="p-2.5 hover:bg-muted rounded-xl transition-colors">
            <Plus className="w-5 h-5 text-fgMuted" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-3">
        {dataSources.map((source) => {
          const Icon = dataSourceIcons[source.id as keyof typeof dataSourceIcons]
          
          return (
            <div key={source.id} className="border border-border rounded-lg p-2 lg:p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="p-1.5 lg:p-2 bg-secondary rounded-md">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm lg:text-base">{source.name}</h3>
                    <p className="text-xs lg:text-sm text-muted-foreground">{source.type}</p>
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
                            value={getStringValue(configForm.sheetsUrl)}
                            onChange={(e) => updateConfigForm('sheetsUrl', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sheet Name
                          </label>
                          <input
                            type="text"
                            placeholder="Sheet1, Data, etc."
                            value={getStringValue(configForm.sheetName)}
                            onChange={(e) => updateConfigForm('sheetName', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Google API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter Google API key..."
                            value={getStringValue(configForm.apiKey)}
                            onChange={(e) => updateConfigForm('apiKey', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="auto-refresh"
                            checked={getBooleanValue(configForm.autoRefresh)}
                            onChange={(e) => updateConfigForm('autoRefresh', e.target.checked)}
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
                            value={getStringValue(configForm.filePath)}
                            onChange={(e) => updateConfigForm('filePath', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Sheet Name
                          </label>
                          <input
                            type="text"
                            placeholder="Sheet1, Data, etc."
                            value={getStringValue(configForm.sheetName)}
                            onChange={(e) => updateConfigForm('sheetName', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Data Range
                          </label>
                          <input
                            type="text"
                            placeholder="A1:Z100 or leave blank for auto-detect"
                            value={getStringValue(configForm.dataRange)}
                            onChange={(e) => updateConfigForm('dataRange', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="header-row"
                            checked={getBooleanValue(configForm.hasHeaders)}
                            onChange={(e) => updateConfigForm('hasHeaders', e.target.checked)}
                            className="rounded"
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
                            value={getStringValue(configForm.connectionString)}
                            onChange={(e) => updateConfigForm('connectionString', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            API Key
                          </label>
                          <input
                            type="password"
                            placeholder="Enter API key..."
                            value={getStringValue(configForm.apiKey)}
                            onChange={(e) => updateConfigForm('apiKey', e.target.value)}
                            className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </div>
                      </>
                    )}
                    
                           <div className="space-y-2">
                             {saveStatus === 'error' && (
                               <div className="flex items-center space-x-2 text-sm text-error bg-error/10 p-2 rounded">
                                 <AlertCircle className="w-4 h-4" />
                                 <span>Error saving configuration. Please try again.</span>
                               </div>
                             )}

                             {saveStatus === 'success' && (
                               <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                 <Check className="w-4 h-4" />
                                 <span>Configuration saved successfully!</span>
                               </div>
                             )}

                             {testResult && (
                               <div className={`flex items-start space-x-2 text-sm p-2 rounded ${
                                 testResult.success 
                                   ? 'text-green-600 bg-green-50' 
                                   : 'text-error bg-error/10'
                               }`}>
                                 {testResult.success ? <Check className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
                                 <div className="flex-1">
                                   <div className="font-medium">{testResult.success ? 'Connection Successful!' : 'Connection Failed'}</div>
                                   <div className="text-xs">{testResult.message}</div>
                                   {testResult.data && (
                                     <div className="text-xs mt-1">
                                       Found {testResult.data.rowCount} rows, {testResult.data.columnCount} columns
                                       {testResult.data.headers.length > 0 && (
                                         <div>Headers: {testResult.data.headers.join(', ')}</div>
                                       )}
                                     </div>
                                   )}
                                   {!testResult.success && testResult.message.includes('API key') && (
                                     <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                       <div className="font-medium text-blue-800 mb-1">📋 How to get a valid Google Sheets API key:</div>
                                       <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                         <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                                         <li>Create a new project or select existing one</li>
                                         <li>Enable Google Sheets API</li>
                                         <li>Go to "Credentials" → "Create Credentials" → "API Key"</li>
                                         <li>Copy the API key and paste it above</li>
                                         <li>Make your Google Sheet publicly readable</li>
                                       </ol>
                                       <div className="mt-1 text-blue-600">
                                         💡 <strong>Quick tip:</strong> Your sheet URL should look like: 
                                         <code className="bg-blue-100 px-1 rounded">https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit</code>
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               </div>
                             )}

                             {source.id === 'google-sheets' && (
                               <button
                                 onClick={() => testConnection(source.id)}
                                 disabled={isTestingConnection || !configForm.apiKey || !configForm.sheetsUrl}
                                 className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-2"
                               >
                                 {isTestingConnection ? (
                                   <>
                                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                     <span>Testing...</span>
                                   </>
                                 ) : (
                                   <>
                                     <TestTube className="w-4 h-4" />
                                     <span>Test Connection</span>
                                   </>
                                 )}
                               </button>
                             )}

                             <button
                               onClick={() => saveConfiguration(source.id)}
                               disabled={isSaving || Object.keys(configForm).length === 0}
                               className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                             >
                               {isSaving ? (
                                 <>
                                   <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                                   <span>Saving...</span>
                                 </>
                               ) : (
                                 <>
                                   <Save className="w-4 h-4" />
                                   <span>{saveStatus === 'success' ? 'Saved!' : 'Save Configuration'}</span>
                                 </>
                               )}
                             </button>

                             {Object.keys(configForm).length === 0 && (
                               <p className="text-xs text-muted-foreground text-center">
                                 Fill in at least one field to save
                               </p>
                             )}
                           </div>
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
