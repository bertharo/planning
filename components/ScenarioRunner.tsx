'use client'

import { useState } from 'react'
import { Play, Loader2, CheckCircle, AlertCircle, BarChart3, TrendingUp, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MotionCard } from '@/components/ui/motion'
import { cn } from '@/lib/utils'
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
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Run Financial Scenario</CardTitle>
          <CardDescription className="text-center">
            Describe your scenario in natural language and see the financial impact
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="scenario-prompt" className="text-sm font-medium">
              Scenario Description
            </label>
            <div className="relative">
              <Textarea
                id="scenario-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Try: 'Increase total ARR by $10M; EMEA ≤ $2M' or 'Reduce churn by 2% across all products'"
                className="min-h-[120px] resize-none"
                disabled={isRunning}
              />
                  <div className="absolute bottom-3 right-3 text-xs text-fgMuted">
                    {prompt.length}/500
                  </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              onClick={handleRunScenario}
              disabled={!prompt.trim() || isRunning}
              size="lg"
              loading={isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Scenario...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Scenario Analysis
                </>
              )}
            </Button>
          </div>
          
          {/* Example Prompts */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Example Scenarios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Increase total ARR by $5M")}
                className="justify-start h-auto p-3 text-left"
              >
                💰 Increase total ARR by $5M
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Increase total ARR by $15M; EMEA ≤ $2M")}
                className="justify-start h-auto p-3 text-left"
              >
                🌍 Increase ARR with EMEA constraint
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Reduce churn by 2% across all products")}
                className="justify-start h-auto p-3 text-left"
              >
                📈 Reduce churn by 2%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Hire 20 engineers for product development")}
                className="justify-start h-auto p-3 text-left"
              >
                👥 Hire 20 engineers
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-error bg-error/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-error rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-error-fg" />
              </div>
              <div>
                <h3 className="font-semibold text-error">Analysis Error</h3>
                <p className="text-sm text-error/80 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-accent-fg" />
                  </div>
                  <span className="text-sm font-medium text-fgMuted">ARR Before</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(result.arr_before)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-fgMuted">ARR After</span>
                </div>
                <p className="text-2xl font-bold">{formatCurrency(result.arr_after)}</p>
              </CardContent>
            </Card>

            <Card className={cn(
              result.arr_delta >= 0 
                ? "border-success/20 bg-success/5" 
                : "border-error/20 bg-error/5"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    result.arr_delta >= 0 ? "bg-success" : "bg-error"
                  )}>
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-fgMuted">ARR Impact</span>
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  result.arr_delta >= 0 ? "text-success" : "text-error"
                )}>
                  {result.arr_delta >= 0 ? '+' : ''}{formatCurrency(result.arr_delta)}
                </p>
                <p className={cn(
                  "text-sm",
                  result.arr_delta >= 0 ? "text-success/80" : "text-error/80"
                )}>
                  {formatPercentage(calculateGrowthRate(result.arr_before, result.arr_after))} growth
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Summary</span>
              </TabsTrigger>
              <TabsTrigger value="deltas" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Analysis</span>
              </TabsTrigger>
              <TabsTrigger value="narrative" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Report</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Scenario Summary</CardTitle>
                  <CardDescription>Run ID: {result.run_id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h4 className="font-medium">Prompt</h4>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">{result.prompt}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Growth Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Starting ARR:</span>
                          <span className="font-medium">{formatCurrency(result.arr_before)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ending ARR:</span>
                          <span className="font-medium">{formatCurrency(result.arr_after)}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t border-border pt-2">
                          <span>Total Change:</span>
                          <span className={result.arr_delta >= 0 ? 'text-success' : 'text-error'}>
                            {result.arr_delta >= 0 ? '+' : ''}{formatCurrency(result.arr_delta)}
                          </span>
                        </div>
                    </div>
                  </div>
                </div>

                  {result.caps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Constraints Applied</h4>
                      <div className="space-y-2">
                        {result.caps.map((cap, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm">{cap.rule}</span>
                            <Badge variant={cap.binding ? "destructive" : "success"}>
                              {cap.binding ? 'BINDING' : 'PASS'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deltas">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Analysis</CardTitle>
                  <CardDescription>
                    Showing {vwDeltas.length} delta records for run {result.run_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {vwDeltas.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-sm font-medium">Metric</th>
                            <th className="text-left py-3 px-4 text-sm font-medium">Scope</th>
                            <th className="text-right py-3 px-4 text-sm font-medium">Before</th>
                            <th className="text-right py-3 px-4 text-sm font-medium">After</th>
                            <th className="text-right py-3 px-4 text-sm font-medium">Delta</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vwDeltas.map((delta, index) => (
                            <tr key={index} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4 text-sm">{delta.metric}</td>
                              <td className="py-3 px-4 text-sm">{delta.scope_type}: {delta.scope_val}</td>
                              <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(delta.before)}</td>
                              <td className="py-3 px-4 text-sm text-right font-medium">{formatCurrency(delta.after)}</td>
                              <td className={`py-3 px-4 text-sm text-right font-semibold ${
                                delta.delta >= 0 ? 'text-success' : 'text-error'
                              }`}>
                                {delta.delta >= 0 ? '+' : ''}{formatCurrency(delta.delta)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                      <div className="text-center py-12">
                        <p className="text-fgMuted">No delta data available</p>
                      </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="narrative">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Report</CardTitle>
                  <CardDescription>AI-generated summary of the scenario execution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="whitespace-pre-wrap leading-relaxed">{result.narrative}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
