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
    <div className="space-y-8">

      {/* Input Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Run Financial Scenario</h2>
            <p className="text-slate-600">Describe your scenario in natural language and see the financial impact</p>
          </div>
          
          <div>
            <label htmlFor="scenario-prompt" className="block text-sm font-semibold text-slate-700 mb-3">
              Scenario Description
            </label>
            <div className="relative">
              <textarea
                id="scenario-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Try: 'Increase total ARR by $10M; EMEA ≤ $2M' or 'Reduce churn by 2% across all products'"
                className="w-full px-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 min-h-[120px] text-slate-900 placeholder-slate-400 resize-none transition-all duration-200"
                disabled={isRunning}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                {prompt.length}/500
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={handleRunScenario}
              disabled={!prompt.trim() || isRunning}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Scenario...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Run Scenario Analysis</span>
                </>
              )}
            </button>
          </div>
          
          {/* Example Prompts */}
          <div className="bg-slate-50 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Example Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setPrompt("Increase total ARR by $5M")}
                className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                💰 Increase total ARR by $5M
              </button>
              <button
                onClick={() => setPrompt("Increase total ARR by $15M; EMEA ≤ $2M")}
                className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                🌍 Increase ARR with EMEA constraint
              </button>
              <button
                onClick={() => setPrompt("Reduce churn by 2% across all products")}
                className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                📈 Reduce churn by 2%
              </button>
              <button
                onClick={() => setPrompt("Hire 20 engineers for product development")}
                className="text-left p-3 bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm"
              >
                👥 Hire 20 engineers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-red-900 font-semibold">Analysis Error</h3>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-blue-700">ARR Before</span>
              </div>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(result.arr_before)}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-700">ARR After</span>
              </div>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(result.arr_after)}</p>
            </div>

            <div className={`bg-gradient-to-br ${result.arr_delta >= 0 ? 'from-emerald-50 to-emerald-100 border-emerald-200' : 'from-red-50 to-red-100 border-red-200'} border rounded-2xl p-6 shadow-sm`}>
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-10 h-10 ${result.arr_delta >= 0 ? 'bg-emerald-500' : 'bg-red-500'} rounded-xl flex items-center justify-center`}>
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className={`text-sm font-semibold ${result.arr_delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>ARR Impact</span>
              </div>
              <p className={`text-3xl font-bold ${result.arr_delta >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                {result.arr_delta >= 0 ? '+' : ''}{formatCurrency(result.arr_delta)}
              </p>
              <p className={`text-sm ${result.arr_delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatPercentage(calculateGrowthRate(result.arr_before, result.arr_after))} growth
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm">
            <nav className="flex space-x-1">
              {[
                { id: 'summary', label: 'Summary', icon: BarChart3 },
                { id: 'deltas', label: 'Detailed Analysis', icon: TrendingUp },
                { id: 'narrative', label: 'Executive Report', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-8 shadow-sm">
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
