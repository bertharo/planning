'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3, Activity } from 'lucide-react'

interface ForecastVisualizationProps {
  forecastData: {
    historicalData: Array<{ period: string; value: number }>
    predictions: Array<{ period: string; value: number }>
    monteCarlo?: {
      simulations: number
      percentiles: {
        p10: Array<{ period: string; value: number }>
        p25: Array<{ period: string; value: number }>
        p50: Array<{ period: string; value: number }>
        p75: Array<{ period: string; value: number }>
        p90: Array<{ period: string; value: number }>
      }
      riskMetrics: {
        valueAtRisk95: number
        expectedShortfall: number
        probabilityOfLoss: number
        maxDrawdown: number
      }
      scenarios: {
        optimistic: Array<{ period: string; value: number }>
        realistic: Array<{ period: string; value: number }>
        pessimistic: Array<{ period: string; value: number }>
      }
    }
    metrics: {
      r2: number
      mape: number
      trend: number
      seasonality: number
    }
    confidence: number
  }
}

export function ForecastVisualization({ forecastData }: ForecastVisualizationProps) {
  const [selectedView, setSelectedView] = useState<'forecast' | 'monte-carlo' | 'scenarios'>('forecast')

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const allData = [...forecastData.historicalData, ...forecastData.predictions]
  const maxValue = Math.max(...allData.map(d => d.value))
  const minValue = Math.min(...allData.map(d => d.value))
  const range = maxValue - minValue

  return (
    <div className="space-y-4">
      {/* Header with View Toggle */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-3 lg:space-y-0">
        <div>
          <h3 className="text-lg font-semibold">Forecast Visualization</h3>
          <p className="text-sm text-muted-foreground">Model confidence: {forecastData.confidence.toFixed(1)}%</p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedView('forecast')}
            className={`px-3 py-2 rounded-md text-sm transition-colors ${
              selectedView === 'forecast'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Forecast
          </button>
          {forecastData.monteCarlo && (
            <>
              <button
                onClick={() => setSelectedView('monte-carlo')}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedView === 'monte-carlo'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Monte Carlo
              </button>
              <button
                onClick={() => setSelectedView('scenarios')}
                className={`px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedView === 'scenarios'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                Scenarios
              </button>
            </>
          )}
        </div>
      </div>

      {/* Model Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium">R² Score</span>
          </div>
          <p className="text-lg font-bold">{(forecastData.metrics.r2 * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">
            {forecastData.metrics.r2 > 0.7 ? 'Strong fit' : forecastData.metrics.r2 > 0.4 ? 'Moderate fit' : 'Weak fit'}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">MAPE</span>
          </div>
          <p className="text-lg font-bold">{forecastData.metrics.mape.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Mean absolute error</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            {forecastData.metrics.trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm font-medium">Trend</span>
          </div>
          <p className="text-lg font-bold">
            {forecastData.metrics.trend > 0 ? '+' : ''}{(forecastData.metrics.trend * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">Per period</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium">Confidence</span>
          </div>
          <p className="text-lg font-bold">{forecastData.confidence.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Model reliability</p>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-card border border-border rounded-lg p-4">
        {selectedView === 'forecast' && (
          <div>
            <h4 className="text-lg font-semibold mb-4">Forecast Chart</h4>
            <div className="h-64 flex items-end justify-between space-x-1">
              {allData.map((point, index) => {
                const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50
                const isHistorical = index < forecastData.historicalData.length
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-full rounded-t ${
                        isHistorical ? 'bg-accent' : 'bg-success'
                      }`}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                      title={`${point.period}: ${formatCurrency(point.value)}`}
                    />
                    <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top">
                      {point.period}
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded"></div>
                <span>Historical Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Forecast</span>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'monte-carlo' && forecastData.monteCarlo && (
          <div>
            <h4 className="text-lg font-semibold mb-4">
              Monte Carlo Simulation ({forecastData.monteCarlo.simulations.toLocaleString()} runs)
            </h4>
            
            {/* Risk Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-sm font-medium text-red-800">VaR (95%)</div>
                <div className="text-lg font-bold text-red-900">
                  {formatPercentage(forecastData.monteCarlo.riskMetrics.valueAtRisk95)}
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="text-sm font-medium text-warning">Expected Shortfall</div>
                <div className="text-lg font-bold text-warning">
                  {formatPercentage(forecastData.monteCarlo.riskMetrics.expectedShortfall)}
                </div>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                <div className="text-sm font-medium text-warning">Loss Probability</div>
                <div className="text-lg font-bold text-warning">
                  {formatPercentage(forecastData.monteCarlo.riskMetrics.probabilityOfLoss)}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-sm font-medium text-purple-800">Max Drawdown</div>
                <div className="text-lg font-bold text-purple-900">
                  {formatPercentage(forecastData.monteCarlo.riskMetrics.maxDrawdown)}
                </div>
              </div>
            </div>

            {/* Confidence Intervals Chart */}
            <div className="h-64 flex items-end justify-between space-x-1">
              {forecastData.monteCarlo?.percentiles.p50.map((point, index) => {
                const p90Height = range > 0 ? (((forecastData.monteCarlo?.percentiles.p90[index]?.value || 0) - minValue) / range) * 100 : 50
                const p75Height = range > 0 ? (((forecastData.monteCarlo?.percentiles.p75[index]?.value || 0) - minValue) / range) * 100 : 50
                const p50Height = range > 0 ? ((point.value - minValue) / range) * 100 : 50
                const p25Height = range > 0 ? (((forecastData.monteCarlo?.percentiles.p25[index]?.value || 0) - minValue) / range) * 100 : 50
                const p10Height = range > 0 ? (((forecastData.monteCarlo?.percentiles.p10[index]?.value || 0) - minValue) / range) * 100 : 50
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 relative">
                    {/* Confidence intervals */}
                    <div className="absolute bottom-0 w-full">
                      {/* 90% confidence interval */}
                      <div
                        className="w-full bg-red-100 absolute bottom-0"
                        style={{ 
                          height: `${p90Height - p10Height}%`,
                          minHeight: '2px'
                        }}
                      />
                      {/* 50% confidence interval */}
                      <div
                        className="w-full bg-accent/20 absolute bottom-0"
                        style={{ 
                          height: `${p75Height - p25Height}%`,
                          minHeight: '2px'
                        }}
                      />
                      {/* Median line */}
                      <div
                        className="w-full bg-accent absolute bottom-0"
                        style={{ 
                          height: `${p50Height}%`,
                          minHeight: '2px'
                        }}
                      />
                    </div>
                    
                    <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top">
                      {point.period}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded"></div>
                <span>Median (50th percentile)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent/20 rounded"></div>
                <span>50% confidence interval</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>90% confidence interval</span>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'scenarios' && forecastData.monteCarlo && (
          <div>
            <h4 className="text-lg font-semibold mb-4">Scenario Analysis</h4>
            
            <div className="h-64 flex items-end justify-between space-x-1">
              {forecastData.monteCarlo?.scenarios.realistic.map((point, index) => {
                const optimisticHeight = range > 0 ? (((forecastData.monteCarlo?.scenarios.optimistic[index]?.value || 0) - minValue) / range) * 100 : 50
                const realisticHeight = range > 0 ? ((point.value - minValue) / range) * 100 : 50
                const pessimisticHeight = range > 0 ? (((forecastData.monteCarlo?.scenarios.pessimistic[index]?.value || 0) - minValue) / range) * 100 : 50
                
                return (
                  <div key={index} className="flex flex-col items-center flex-1 space-y-1">
                    {/* Optimistic */}
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${optimisticHeight * 0.3}%`, minHeight: '2px' }}
                      title={`Optimistic: ${formatCurrency(forecastData.monteCarlo?.scenarios.optimistic[index].value || 0)}`}
                    />
                    {/* Realistic */}
                    <div
                      className="w-full bg-accent rounded-t"
                      style={{ height: `${realisticHeight * 0.3}%`, minHeight: '2px' }}
                      title={`Realistic: ${formatCurrency(point.value)}`}
                    />
                    {/* Pessimistic */}
                    <div
                      className="w-full bg-red-500 rounded-t"
                      style={{ height: `${pessimisticHeight * 0.3}%`, minHeight: '2px' }}
                      title={`Pessimistic: ${formatCurrency(forecastData.monteCarlo?.scenarios.pessimistic[index].value || 0)}`}
                    />
                    
                    <span className="text-xs text-muted-foreground mt-1 transform -rotate-45 origin-top">
                      {point.period}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="flex items-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Optimistic (90th percentile)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent rounded"></div>
                <span>Realistic (50th percentile)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Pessimistic (10th percentile)</span>
              </div>
            </div>

            {/* Scenario Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-2">Optimistic Scenario</h5>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(forecastData.monteCarlo.scenarios.optimistic[forecastData.monteCarlo.scenarios.optimistic.length - 1]?.value || 0)}
                </p>
                <p className="text-sm text-fgMuted">Final period projection</p>
              </div>
              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <h5 className="font-semibold text-fg mb-2">Realistic Scenario</h5>
                <p className="text-2xl font-bold text-fg">
                  {formatCurrency(forecastData.monteCarlo.scenarios.realistic[forecastData.monteCarlo.scenarios.realistic.length - 1]?.value || 0)}
                </p>
                <p className="text-sm text-fgMuted">Most likely outcome</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-semibold text-red-800 mb-2">Pessimistic Scenario</h5>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(forecastData.monteCarlo.scenarios.pessimistic[forecastData.monteCarlo.scenarios.pessimistic.length - 1]?.value || 0)}
                </p>
                <p className="text-sm text-red-700">Worst-case scenario</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
