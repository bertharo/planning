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

interface RunStatus {
  RUN_ID: string
  prompt: string
  user: string
  started_at: string
  finished_at: string
  status: string
  before_hash: string
  after_hash: string
}

export class AppsScriptService {
  
  async runScenario(prompt: string): Promise<ScenarioResult> {
    try {
      const response = await fetch('/api/run-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to run scenario')
      }

      return await response.json()
    } catch (error) {
      console.error('Error running scenario:', error)
      throw error
    }
  }

  async getVWDeltas(runId: string): Promise<VWDelta[]> {
    try {
      const response = await fetch(`/api/vw-deltas?run_id=${encodeURIComponent(runId)}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch VW deltas')
      }

      const data = await response.json()
      return data.rows || []
    } catch (error) {
      console.error('Error fetching VW deltas:', error)
      throw error
    }
  }

  async getRunStatus(runId: string): Promise<RunStatus | null> {
    try {
      const response = await fetch(`/api/run-status?run_id=${encodeURIComponent(runId)}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch run status')
      }

      const data = await response.json()
      return data.row || null
    } catch (error) {
      console.error('Error fetching run status:', error)
      throw error
    }
  }

  async getNarrative(runId: string): Promise<string> {
    try {
      const response = await fetch(`/api/narrative?run_id=${encodeURIComponent(runId)}`)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch narrative')
      }

      const data = await response.json()
      return data.narrative || ''
    } catch (error) {
      console.error('Error fetching narrative:', error)
      throw error
    }
  }

  // Helper method to format currency
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Helper method to format percentage
  formatPercentage(value: number): string {
    return `${(value * 100).toFixed(1)}%`
  }

  // Helper method to calculate growth rate
  calculateGrowthRate(before: number, after: number): number {
    if (before === 0) return 0
    return (after - before) / before
  }
}

// Create a singleton instance
export const appsScriptService = new AppsScriptService()
