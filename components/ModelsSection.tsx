'use client'

import { useState, useEffect } from 'react'
import { 
  Plus, 
  BarChart3, 
  DollarSign, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Eye,
  TrendingUp
} from 'lucide-react'
import { ForecastVisualization } from './ForecastVisualization'

interface Model {
  id: string
  name: string
  type: 'Revenue' | 'CapEx' | 'Personnel' | 'Forecast'
  description: string
  lastModified: Date
  createdBy: string
  data?: any // For forecast models
  config?: any // For forecast models
}

const modelIcons = {
  Revenue: DollarSign,
  CapEx: BarChart3,
  Personnel: Users,
  Forecast: TrendingUp,
}

const mockModels: Model[] = [
  {
    id: '1',
    name: 'Q4 Revenue Forecast',
    type: 'Revenue',
    description: 'SaaS revenue model with monthly recurring revenue projections',
    lastModified: new Date('2024-01-15'),
    createdBy: 'John Doe'
  },
  {
    id: '2',
    name: 'Infrastructure CapEx',
    type: 'CapEx',
    description: 'Capital expenditures for cloud infrastructure and equipment',
    lastModified: new Date('2024-01-10'),
    createdBy: 'Jane Smith'
  },
  {
    id: '3',
    name: 'Engineering Headcount',
    type: 'Personnel',
    description: 'Engineering team growth and compensation planning',
    lastModified: new Date('2024-01-08'),
    createdBy: 'Mike Johnson'
  }
]

export function ModelsSection() {
  const [models, setModels] = useState<Model[]>(mockModels)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedType, setSelectedType] = useState<'Revenue' | 'CapEx' | 'Personnel'>('Revenue')
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)

  // Load AI-generated models from localStorage
  useEffect(() => {
    const loadAIGeneratedModels = () => {
      if (typeof window === 'undefined') return
      
      try {
        const savedModels = localStorage.getItem('savedModels')
        if (savedModels) {
          const aiModels = JSON.parse(savedModels)
          const formattedModels = aiModels.map((aiModel: any) => ({
            id: aiModel.id,
            name: aiModel.name,
            type: aiModel.type,
            description: aiModel.description,
            lastModified: new Date(aiModel.lastModified),
            createdBy: aiModel.createdBy,
            data: aiModel.data,
            config: aiModel.config
          }))
          
          // Add AI models to the beginning of the list
          setModels(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const newAiModels = formattedModels.filter((m: any) => !existingIds.has(m.id))
            return [...newAiModels, ...prev]
          })
        }
      } catch (error) {
        console.error('Error loading AI-generated models:', error)
      }
    }

    loadAIGeneratedModels()
    
    // Check for new AI models periodically
    const interval = setInterval(loadAIGeneratedModels, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleCreateModel = () => {
    const newModel: Model = {
      id: Date.now().toString(),
      name: `New ${selectedType} Model`,
      type: selectedType,
      description: `A new ${selectedType.toLowerCase()} model`,
      lastModified: new Date(),
      createdBy: 'Current User'
    }
    setModels(prev => [newModel, ...prev])
    setShowCreateModal(false)
  }

  const handleDeleteModel = (id: string) => {
    setModels(prev => prev.filter(model => model.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Models</h2>
          <p className="text-muted-foreground">Create and manage your financial planning models</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-fg border border-border rounded-md hover:bg-muted"
        >
          <Plus className="w-4 h-4" />
          <span>New Model</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => {
          const Icon = modelIcons[model.type]
          
          return (
            <div key={model.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{model.name}</h3>
                    <p className="text-sm text-muted-foreground">{model.type} Model</p>
                  </div>
                </div>
                
                <div className="relative group">
                  <button className="p-1 hover:bg-accent rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute right-0 top-8 w-48 bg-white border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="p-1">
                      <button 
                        onClick={() => setSelectedModel(model)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                      <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteModel(model.id)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Modified {model.lastModified.toLocaleDateString()}</span>
                <span>by {model.createdBy}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Model Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Model</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Model Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Revenue', 'CapEx', 'Personnel'] as const).map((type) => {
                    const Icon = modelIcons[type]
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`p-3 border rounded-md flex flex-col items-center space-y-2 ${
                          selectedType === type
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{type}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateModel}
                  className="flex-1 px-4 py-2 bg-white text-fg border border-border rounded-md hover:bg-muted"
                >
                  Create Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Model Viewer Modal */}
      {selectedModel && selectedModel.type === 'Forecast' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedModel.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedModel.description}</p>
                </div>
                <button
                  onClick={() => setSelectedModel(null)}
                  className="p-2 hover:bg-accent rounded-md"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {selectedModel.data && (
                <ForecastVisualization forecastData={selectedModel.data} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
