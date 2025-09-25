'use client'

import { useState } from 'react'
import { 
  Plus, 
  GitBranch, 
  TrendingUp, 
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Play
} from 'lucide-react'

interface Scenario {
  id: string
  name: string
  description: string
  baseModel: string
  assumptions: string[]
  lastModified: Date
  createdBy: string
  status: 'draft' | 'active' | 'archived'
}

const mockScenarios: Scenario[] = [
  {
    id: '1',
    name: 'Optimistic Growth',
    description: 'Best-case scenario with 50% growth acceleration',
    baseModel: 'Q4 Revenue Forecast',
    assumptions: ['50% faster growth', 'Lower churn rate', 'Premium pricing'],
    lastModified: new Date('2024-01-12'),
    createdBy: 'John Doe',
    status: 'active'
  },
  {
    id: '2',
    name: 'Economic Downturn',
    description: 'Conservative scenario accounting for market volatility',
    baseModel: 'Q4 Revenue Forecast',
    assumptions: ['20% growth reduction', 'Higher churn rate', 'Competitive pricing'],
    lastModified: new Date('2024-01-10'),
    createdBy: 'Jane Smith',
    status: 'draft'
  },
  {
    id: '3',
    name: 'Aggressive Hiring',
    description: 'Rapid team expansion scenario',
    baseModel: 'Engineering Headcount',
    assumptions: ['Double hiring pace', 'Premium talent acquisition', 'Higher compensation'],
    lastModified: new Date('2024-01-08'),
    createdBy: 'Mike Johnson',
    status: 'active'
  }
]

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-800'
}

export function ScenariosSection() {
  const [scenarios, setScenarios] = useState<Scenario[]>(mockScenarios)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleCreateScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: 'New Scenario',
      description: 'A new scenario for analysis',
      baseModel: 'Q4 Revenue Forecast',
      assumptions: [],
      lastModified: new Date(),
      createdBy: 'Current User',
      status: 'draft'
    }
    setScenarios(prev => [newScenario, ...prev])
    setShowCreateModal(false)
  }

  const handleDeleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id))
  }

  const handleDuplicateScenario = (scenario: Scenario) => {
    const duplicatedScenario: Scenario = {
      ...scenario,
      id: Date.now().toString(),
      name: `${scenario.name} (Copy)`,
      lastModified: new Date(),
      status: 'draft'
    }
    setScenarios(prev => [duplicatedScenario, ...prev])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Scenarios</h2>
          <p className="text-muted-foreground">Create and analyze different business scenarios</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          <span>New Scenario</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary rounded-md">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <p className="text-sm text-muted-foreground">{scenario.baseModel}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[scenario.status]}`}>
                  {scenario.status}
                </span>
                
                <div className="relative group">
                  <button className="p-1 hover:bg-accent rounded">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute right-0 top-8 w-48 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="p-1">
                      <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded">
                        <Play className="w-4 h-4" />
                        <span>Run Analysis</span>
                      </button>
                      <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded">
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDuplicateScenario(scenario)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteScenario(scenario.id)}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-accent rounded text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
            
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium">Key Assumptions:</h4>
              <div className="space-y-1">
                {scenario.assumptions.map((assumption, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-sm text-muted-foreground">{assumption}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Modified {scenario.lastModified.toLocaleDateString()}</span>
              <span>by {scenario.createdBy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Scenario Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New Scenario</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Scenario Name</label>
                <input
                  type="text"
                  placeholder="Enter scenario name..."
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe this scenario..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Base Model</label>
                <select className="w-full px-3 py-2 border border-input rounded-md text-sm">
                  <option>Q4 Revenue Forecast</option>
                  <option>Infrastructure CapEx</option>
                  <option>Engineering Headcount</option>
                </select>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateScenario}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Create Scenario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
