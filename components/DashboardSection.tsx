'use client'

import { TrendingUp, DollarSign, Users, Target, ArrowUpRight, ArrowDownRight, Calendar, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function DashboardSection() {
  const kpis = [
    {
      title: 'Total ARR',
      value: '$125.5M',
      change: '+12.5%',
      trend: 'up',
      description: 'vs last quarter',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Active Customers',
      value: '2,847',
      change: '+8.2%',
      trend: 'up',
      description: 'vs last month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Growth Rate',
      value: '15.3%',
      change: '+2.1%',
      trend: 'up',
      description: 'YoY growth',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Target Achievement',
      value: '94%',
      change: '-3%',
      trend: 'down',
      description: 'of annual target',
      icon: Target,
      color: 'text-orange-600'
    }
  ]

  const recentScenarios = [
    {
      name: 'Q4 Growth Initiative',
      status: 'completed',
      impact: '+$15M ARR',
      date: '2 days ago',
      type: 'Revenue Growth'
    },
    {
      name: 'EMEA Expansion',
      status: 'in-progress',
      impact: '+$8M ARR',
      date: '1 week ago',
      type: 'Market Expansion'
    },
    {
      name: 'Cost Optimization',
      status: 'draft',
      impact: '-$2M OpEx',
      date: '2 weeks ago',
      type: 'Cost Management'
    }
  ]

  const quickActions = [
    { label: 'Create Scenario', icon: BarChart3, color: 'bg-blue-500' },
    { label: 'Run Forecast', icon: TrendingUp, color: 'bg-green-500' },
    { label: 'View Reports', icon: Target, color: 'bg-purple-500' },
    { label: 'Schedule Review', icon: Calendar, color: 'bg-orange-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600">Monitor your financial performance and key metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 break-words">{kpi.title}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 break-words">{kpi.value}</div>
                <div className="flex items-center space-x-1 mt-1 flex-wrap">
                  <TrendIcon className={`h-3 w-3 ${kpi.color} flex-shrink-0`} />
                  <span className={`text-sm font-medium ${kpi.color} break-words`}>{kpi.change}</span>
                  <span className="text-sm text-gray-500 break-words">{kpi.description}</span>
      </div>
              </CardContent>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full"></div>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scenarios */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Recent Scenarios</span>
            </CardTitle>
            <CardDescription>Latest scenario planning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentScenarios.map((scenario, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1 flex-wrap">
                      <h4 className="font-medium text-gray-900 break-words">{scenario.name}</h4>
                      <Badge 
                        variant={scenario.status === 'completed' ? 'default' : scenario.status === 'in-progress' ? 'secondary' : 'outline'}
                        className="text-xs flex-shrink-0"
                      >
                        {scenario.status}
                      </Badge>
      </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 flex-wrap gap-2">
                      <span className="font-medium text-green-600 break-words">{scenario.impact}</span>
                      <span className="break-words">{scenario.type}</span>
                      <span className="break-words">{scenario.date}</span>
      </div>
    </div>
                  <Button variant="ghost" size="sm" className="flex-shrink-0">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
    </div>
              ))}
      </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common planning tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon
  return (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start h-12 hover:bg-gray-50"
                  >
                    <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mr-3`}>
                      <Icon className="h-4 w-4 text-white" />
          </div>
                    {action.label}
                  </Button>
        )
      })}
    </div>
          </CardContent>
        </Card>
    </div>

      {/* Performance Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>ARR Trend Analysis</CardTitle>
          <CardDescription>12-month ARR performance and projections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization will appear here</p>
              <p className="text-sm text-gray-500">Connect your data sources to see real metrics</p>
        </div>
      </div>
        </CardContent>
      </Card>
    </div>
  )
}