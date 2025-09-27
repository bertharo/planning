'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3,
  Activity,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'

interface DashboardData {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  arr: {
    current: number
    previous: number
    growth: number
  }
  mrr: {
    current: number
    previous: number
    growth: number
  }
  charts: {
    revenueTrend: Array<{ month: string; value: number }>
    customerGrowth: Array<{ month: string; value: number }>
    productBreakdown: Array<{ product: string; value: number; color: string }>
    regionBreakdown: Array<{ region: string; value: number; color: string }>
  }
  tables: {
    topProducts: Array<{ product: string; revenue: number; growth: number }>
    regionalPerformance: Array<{ region: string; revenue: number; customers: number }>
  }
}

export function DashboardSection() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState('6M')

  // Generate realistic dashboard data
  useEffect(() => {
    const generateDashboardData = () => {
      const currentRevenue = Math.floor(Math.random() * 2000000) + 5000000
      const previousRevenue = Math.floor(currentRevenue * 0.92)
      const currentCustomers = Math.floor(Math.random() * 500) + 1500
      const previousCustomers = Math.floor(currentCustomers * 0.95)
      const currentArr = Math.floor(currentRevenue * 12)
      const previousArr = Math.floor(currentArr * 0.93)
      const currentMrr = Math.floor(currentRevenue)
      const previousMrr = Math.floor(currentMrr * 0.94)

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      const revenueTrend = months.map((month, index) => ({
        month,
        value: Math.floor(currentRevenue * (0.8 + Math.random() * 0.4) * (1 + index * 0.02))
      }))

      const customerGrowth = months.map((month, index) => ({
        month,
        value: Math.floor(currentCustomers * (0.9 + Math.random() * 0.2) * (1 + index * 0.015))
      }))

      const productBreakdown = [
        { product: 'Product 001', value: Math.floor(currentRevenue * 0.35), color: '#3b82f6' },
        { product: 'Product 013', value: Math.floor(currentRevenue * 0.25), color: '#10b981' },
        { product: 'Product 007', value: Math.floor(currentRevenue * 0.20), color: '#f59e0b' },
        { product: 'Product 045', value: Math.floor(currentRevenue * 0.15), color: '#ef4444' },
        { product: 'Others', value: Math.floor(currentRevenue * 0.05), color: '#8b5cf6' }
      ]

      const regionBreakdown = [
        { region: 'US', value: Math.floor(currentRevenue * 0.45), color: '#3b82f6' },
        { region: 'Europe', value: Math.floor(currentRevenue * 0.25), color: '#10b981' },
        { region: 'Asia', value: Math.floor(currentRevenue * 0.20), color: '#f59e0b' },
        { region: 'Australia', value: Math.floor(currentRevenue * 0.10), color: '#ef4444' }
      ]

      const topProducts = [
        { product: 'Product 001', revenue: Math.floor(currentRevenue * 0.35), growth: 12.5 },
        { product: 'Product 013', revenue: Math.floor(currentRevenue * 0.25), growth: 8.3 },
        { product: 'Product 007', revenue: Math.floor(currentRevenue * 0.20), growth: -2.1 },
        { product: 'Product 045', revenue: Math.floor(currentRevenue * 0.15), growth: 15.7 },
        { product: 'Product 089', revenue: Math.floor(currentRevenue * 0.05), growth: 22.1 }
      ]

      const regionalPerformance = [
        { region: 'US', revenue: Math.floor(currentRevenue * 0.45), customers: Math.floor(currentCustomers * 0.50) },
        { region: 'Europe', revenue: Math.floor(currentRevenue * 0.25), customers: Math.floor(currentCustomers * 0.30) },
        { region: 'Asia', revenue: Math.floor(currentRevenue * 0.20), customers: Math.floor(currentCustomers * 0.15) },
        { region: 'Australia', revenue: Math.floor(currentRevenue * 0.10), customers: Math.floor(currentCustomers * 0.05) }
      ]

      setDashboardData({
        revenue: {
          current: currentRevenue,
          previous: previousRevenue,
          growth: ((currentRevenue - previousRevenue) / previousRevenue) * 100
        },
        customers: {
          current: currentCustomers,
          previous: previousCustomers,
          growth: ((currentCustomers - previousCustomers) / previousCustomers) * 100
        },
        arr: {
          current: currentArr,
          previous: previousArr,
          growth: ((currentArr - previousArr) / previousArr) * 100
        },
        mrr: {
          current: currentMrr,
          previous: previousMrr,
          growth: ((currentMrr - previousMrr) / previousMrr) * 100
        },
        charts: {
          revenueTrend,
          customerGrowth,
          productBreakdown,
          regionBreakdown
        },
        tables: {
          topProducts,
          regionalPerformance
        }
      })
      setIsLoading(false)
    }

    setTimeout(generateDashboardData, 1000)
  }, [selectedTimeframe])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0
    return (
      <span className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{Math.abs(growth).toFixed(1)}%</span>
      </span>
    )
  }

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-3 lg:space-y-0">
        <div>
          <h2 className="text-lg lg:text-2xl font-bold">Financial Dashboard</h2>
          <p className="text-xs lg:text-sm text-muted-foreground">Real-time insights from your connected data sources</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full lg:w-auto">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-input rounded-md text-xs lg:text-sm"
          >
            <option value="1M">Last Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">Last Year</option>
          </select>
          <button className="flex items-center justify-center space-x-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            <Download className="w-4 h-4" />
            <span className="text-xs lg:text-sm">Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(dashboardData.revenue.current)}
          growth={dashboardData.revenue.growth}
          icon={<DollarSign className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Customers"
          value={dashboardData.customers.current.toLocaleString()}
          growth={dashboardData.customers.growth}
          icon={<Users className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="ARR"
          value={formatCurrency(dashboardData.arr.current)}
          growth={dashboardData.arr.growth}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="MRR"
          value={formatCurrency(dashboardData.mrr.current)}
          growth={dashboardData.mrr.growth}
          icon={<Activity className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <ChartCard
          title="Revenue Trend"
          data={dashboardData.charts.revenueTrend}
          type="line"
        />
        <ChartCard
          title="Customer Growth"
          data={dashboardData.charts.customerGrowth}
          type="bar"
        />
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <ChartCard
          title="Product Revenue Breakdown"
          data={dashboardData.charts.productBreakdown}
          type="pie"
        />
        <ChartCard
          title="Regional Performance"
          data={dashboardData.charts.regionBreakdown}
          type="pie"
        />
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-6">
        <TableCard
          title="Top Products by Revenue"
          data={dashboardData.tables.topProducts}
          columns={[
            { key: 'product', label: 'Product', render: (value) => value },
            { key: 'revenue', label: 'Revenue', render: (value) => formatCurrency(value) },
            { key: 'growth', label: 'Growth', render: (value) => formatGrowth(value) }
          ]}
        />
        <TableCard
          title="Regional Performance"
          data={dashboardData.tables.regionalPerformance}
          columns={[
            { key: 'region', label: 'Region', render: (value) => value },
            { key: 'revenue', label: 'Revenue', render: (value) => formatCurrency(value) },
            { key: 'customers', label: 'Customers', render: (value) => value.toLocaleString() }
          ]}
        />
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  growth: number
  icon: React.ReactNode
  color: 'blue' | 'green' | 'purple' | 'warning'
}

function MetricCard({ title, value, growth, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-accent/10 text-accent border-accent/20',
    green: 'bg-success/10 text-success border-success/20',
    purple: 'bg-ch-3/10 text-ch-3 border-ch-3/20',
    warning: 'bg-warning/10 text-warning border-warning/20'
  }

  const isPositive = growth >= 0

  return (
    <div className="bg-card border border-border rounded-lg p-3 lg:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`p-1.5 lg:p-2 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-xs lg:text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(growth).toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-2 lg:mt-4">
        <p className="text-lg lg:text-2xl font-bold">{value}</p>
        <p className="text-xs lg:text-sm text-muted-foreground">{title}</p>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  data: any[]
  type: 'line' | 'bar' | 'pie'
}

function ChartCard({ title, data, type }: ChartCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 lg:p-6">
      <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-4">{title}</h3>
      <div className="h-48 lg:h-64 flex items-center justify-center">
        {type === 'line' && <LineChart data={data} />}
        {type === 'bar' && <BarChart data={data} />}
        {type === 'pie' && <CustomPieChart data={data} />}
      </div>
    </div>
  )
}

interface TableCardProps {
  title: string
  data: any[]
  columns: Array<{ key: string; label: string; render: (value: any) => React.ReactNode }>
}

function TableCard({ title, data, columns }: TableCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 lg:p-6">
      <h3 className="text-sm lg:text-lg font-semibold mb-3 lg:mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((column) => (
                <th key={column.key} className="text-left py-2 px-2 lg:px-3 text-xs lg:text-sm font-medium text-muted-foreground">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-border/50">
                {columns.map((column) => (
                  <td key={column.key} className="py-2 lg:py-3 px-2 lg:px-3 text-xs lg:text-sm">
                    {column.render(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Simple Chart Components
function LineChart({ data }: { data: Array<{ month: string; value: number }> }) {
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue

  return (
    <div className="w-full h-full flex items-end justify-between space-x-1">
      {data.map((point, index) => {
        const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-accent rounded-t"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-muted-foreground mt-1">{point.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function BarChart({ data }: { data: Array<{ month: string; value: number }> }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div className="w-full h-full flex items-end justify-between space-x-1">
      {data.map((point, index) => {
        const height = (point.value / maxValue) * 100
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-full bg-success rounded-t"
              style={{ height: `${height}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-muted-foreground mt-1">{point.month}</span>
          </div>
        )
      })}
    </div>
  )
}

function CustomPieChart({ data }: { data: Array<{ product?: string; region?: string; value: number; color: string }> }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let cumulativePercentage = 0

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const startAngle = cumulativePercentage * 3.6
          const endAngle = (cumulativePercentage + percentage) * 3.6
          
          cumulativePercentage += percentage

          const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
          const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)
          
          const largeArcFlag = percentage > 50 ? 1 : 0

          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ')

          return (
            <path
              key={index}
              d={pathData}
              fill={item.color}
              stroke="white"
              strokeWidth="1"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-semibold">{total.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  )
}
