'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle, AlertCircle, BarChart3, TrendingUp, FileText } from 'lucide-react'
import { appsScriptService } from '@/lib/appsScriptService'

interface ScenarioResult {
  run_id: string
  prompt: string
  arr_before: number
  arr_after: number
  arr_delta: number
  caps: Array<{
    rule: string
    binding: boolean
    initialUsd: number
    finalUsd: number
    capUsd: number
  }>
  narrative: string
}

interface VWDelta {
  RUN_ID: string
  metric: string
  scope_type: string
  scope_val: string
  before: number
  after: number
  delta: number
  unit: string
}

export function ScenarioRunner() {
  const [prompt, setPrompt] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<ScenarioResult | null>(null)
  const [vwDeltas, setVwDeltas] = useState<VWDelta[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'deltas' | 'narrative'>('summary')

  const handleRunScenario = async () => {
    if (!prompt.trim()) return

    setIsRunning(true)
    setError(null)
    setResult(null)
    setVwDeltas([])

    try {
      // Run the scenario
      const scenarioResult = await appsScriptService.runScenario(prompt)
      setResult(scenarioResult)

      // Fetch VW deltas
      const deltas = await appsScriptService.getVWDeltas(scenarioResult.run_id)
      setVwDeltas(deltas)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run scenario')
    } finally {
      setIsRunning(false)
    }
  }

  const formatCurrency = (value: number) => {
    return appsScriptService.formatCurrency(value)
  }

  const formatPercentage = (value: number) => {
    return appsScriptService.formatPercentage(value)
  }

  const calculateGrowthRate = (before: number, after: number) => {
    return appsScriptService.calculateGrowthRate(before, after)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Scenario Runner</h2>
        <p className="text-muted-foreground">Run financial scenarios using your connected Apps Script model</p>
      </div>

      {/* Input Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="scenario-prompt" className="block text-sm font-medium mb-2">
              Scenario Prompt
            </label>
            <textarea
              id="scenario-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your scenario prompt (e.g., 'Increase total ARR by $10M; EMEA ≤ $2M; Enterprise ≤ $5M')"
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring min-h-[100px]"
              disabled={isRunning}
            />
          </div>
          
          <button
            onClick={handleRunScenario}
            disabled={!prompt.trim() || isRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running Scenario...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Scenario</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <span className="text-destructive font-medium">Error</span>
          </div>
          <p className="text-destructive mt-1">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">ARR Before</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(result.arr_before)}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">ARR After</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(result.arr_after)}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">ARR Delta</span>
              </div>
              <p className={`text-2xl font-bold ${result.arr_delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.arr_delta >= 0 ? '+' : ''}{formatCurrency(result.arr_delta)}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatPercentage(calculateGrowthRate(result.arr_before, result.arr_after))} growth
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex space-x-8">
              {[
                { id: 'summary', label: 'Summary', icon: BarChart3 },
                { id: 'deltas', label: 'Deltas', icon: TrendingUp },
                { id: 'narrative', label: 'Narrative', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-card border border-border rounded-lg p-6">
            {activeTab === 'summary' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Scenario Summary</h3>
                  <p className="text-muted-foreground">Run ID: {result.run_id}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Prompt</h4>
                    <p className="text-sm bg-muted p-3 rounded">{result.prompt}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Growth Analysis</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Starting ARR:</span>
                        <span>{formatCurrency(result.arr_before)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ending ARR:</span>
                        <span>{formatCurrency(result.arr_after)}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total Change:</span>
                        <span className={result.arr_delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {result.arr_delta >= 0 ? '+' : ''}{formatCurrency(result.arr_delta)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {result.caps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Constraints Applied</h4>
                    <div className="space-y-2">
                      {result.caps.map((cap, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{cap.rule}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            cap.binding ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {cap.binding ? 'BINDING' : 'PASS'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deltas' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Detailed Deltas</h3>
                  <p className="text-sm text-muted-foreground">
                    Showing {vwDeltas.length} delta records for run {result.run_id}
                  </p>
                </div>

                {vwDeltas.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-sm font-medium">Metric</th>
                          <th className="text-left py-2 px-3 text-sm font-medium">Scope</th>
                          <th className="text-right py-2 px-3 text-sm font-medium">Before</th>
                          <th className="text-right py-2 px-3 text-sm font-medium">After</th>
                          <th className="text-right py-2 px-3 text-sm font-medium">Delta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vwDeltas.map((delta, index) => (
                          <tr key={index} className="border-b border-border/50">
                            <td className="py-2 px-3 text-sm">{delta.metric}</td>
                            <td className="py-2 px-3 text-sm">{delta.scope_type}: {delta.scope_val}</td>
                            <td className="py-2 px-3 text-sm text-right">{formatCurrency(delta.before)}</td>
                            <td className="py-2 px-3 text-sm text-right">{formatCurrency(delta.after)}</td>
                            <td className={`py-2 px-3 text-sm text-right font-medium ${
                              delta.delta >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {delta.delta >= 0 ? '+' : ''}{formatCurrency(delta.delta)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No delta data available</p>
                )}
              </div>
            )}

            {activeTab === 'narrative' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Scenario Narrative</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-generated summary of the scenario execution
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="whitespace-pre-wrap">{result.narrative}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
