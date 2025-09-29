'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Download, Share2, Filter, Search, Plus, BarChart3, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

interface Scenario {
  id: string
  name: string
  description: string
  status: 'draft' | 'running' | 'completed' | 'failed'
  createdAt: Date
  lastRun?: Date
  arrBefore: number
  arrAfter: number
  arrDelta: number
  confidence: number
  tags: string[]
  author: string
}

export function EnhancedScenariosSection() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [isCreating, setIsCreating] = useState(false)

  // Sample scenarios data
  useEffect(() => {
    const sampleScenarios: Scenario[] = [
      {
        id: '1',
        name: 'Q4 Growth Initiative',
        description: 'Increase ARR by $15M with EMEA constraint',
        status: 'completed',
        createdAt: new Date('2024-01-15'),
        lastRun: new Date('2024-01-20'),
        arrBefore: 125500000,
        arrAfter: 140500000,
        arrDelta: 15000000,
        confidence: 87,
        tags: ['Revenue Growth', 'EMEA', 'Q4'],
        author: 'Finance Team'
      },
      {
        id: '2',
        name: 'Workforce Expansion',
        description: 'Hire 20 engineers for product development',
        status: 'running',
        createdAt: new Date('2024-01-18'),
        arrBefore: 125500000,
        arrAfter: 127500000,
        arrDelta: 2000000,
        confidence: 92,
        tags: ['Headcount', 'Engineering', 'Growth'],
        author: 'HR Team'
      },
      {
        id: '3',
        name: 'Cost Optimization',
        description: 'Reduce operational expenses by 10%',
        status: 'draft',
        createdAt: new Date('2024-01-22'),
        arrBefore: 125500000,
        arrAfter: 125500000,
        arrDelta: 0,
        confidence: 0,
        tags: ['Cost Management', 'Efficiency'],
        author: 'Operations'
      }
    ]
    setScenarios(sampleScenarios)
  }, [])

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || scenario.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDelta = (delta: number) => {
    const sign = delta >= 0 ? '+' : ''
    return `${sign}${formatCurrency(delta)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scenario Planning</h2>
          <p className="text-gray-600">Create, run, and analyze what-if scenarios</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Runner */}
      {isCreating && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span>Create New Scenario</span>
            </CardTitle>
            <CardDescription>
              Use natural language to describe your scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="scenario-prompt" className="text-sm font-medium">
                  Scenario Description
                </label>
                <textarea
                  id="scenario-prompt"
                  placeholder="Try: 'Increase total ARR by $15M; EMEA ≤ $2M' or 'Hire 20 engineers for product development'"
                  className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Use natural language to describe your scenario
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Run Scenario
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredScenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-semibold text-gray-900 mb-1 break-words">
                    {scenario.name}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 mb-3 break-words">
                    {scenario.description}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(scenario.status)} text-xs font-medium flex-shrink-0`}>
                  {scenario.status}
                </Badge>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {scenario.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* ARR Impact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Before</div>
                    <div className="font-semibold text-gray-900 text-sm break-words">
                      {formatCurrency(scenario.arrBefore)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-1">After</div>
                    <div className="font-semibold text-gray-900 text-sm break-words">
                      {formatCurrency(scenario.arrAfter)}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-1">Delta</div>
                    <div className={`font-semibold text-sm break-words ${
                      scenario.arrDelta >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatDelta(scenario.arrDelta)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Confidence Score */}
              {scenario.confidence > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          scenario.confidence >= 80 ? 'bg-green-500' : 
                          scenario.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${scenario.confidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${getConfidenceColor(scenario.confidence)}`}>
                      {scenario.confidence}%
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                <div className="text-xs text-gray-500 flex-1 min-w-0">
                  <span className="break-words">by {scenario.author}</span>
                  <span className="mx-1">•</span>
                  <span className="break-words">{scenario.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  {scenario.status === 'running' ? (
                    <Button variant="outline" size="sm" disabled>
                      <Pause className="h-3 w-3 mr-1" />
                      Running
                    </Button>
                  ) : scenario.status === 'completed' ? (
                    <Button variant="outline" size="sm">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Rerun
                    </Button>
                  ) : (
                    <Button size="sm">
                      <Play className="h-3 w-3 mr-1" />
                      Run
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredScenarios.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No scenarios found</h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first scenario to get started with planning'
              }
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Scenario
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
