interface ForecastData {
  period: string
  value: number
  date?: Date
}

interface ForecastResult {
  historicalData: ForecastData[]
  predictions: ForecastData[]
  confidence: number
  algorithm: string
  metrics: {
    r2: number
    mape: number
    trend: number
    seasonality: number
  }
  insights: string[]
  monteCarlo?: MonteCarloResults
}

interface MonteCarloResults {
  simulations: number
  percentiles: {
    p10: ForecastData[]
    p25: ForecastData[]
    p50: ForecastData[]
    p75: ForecastData[]
    p90: ForecastData[]
  }
  riskMetrics: {
    valueAtRisk95: number
    expectedShortfall: number
    probabilityOfLoss: number
    maxDrawdown: number
  }
  scenarios: {
    optimistic: ForecastData[]
    realistic: ForecastData[]
    pessimistic: ForecastData[]
  }
}

interface ForecastConfig {
  targetColumn: string
  timeColumn: string
  forecastPeriods: number
  algorithm: 'linear' | 'exponential' | 'seasonal' | 'moving_average'
  groupBy?: string // For grouping by product, region, etc.
  monteCarlo?: {
    enabled: boolean
    simulations: number
    volatilityFactor: number
    driftFactor: number
  }
}

export class ForecastService {
  
  async createForecastModel(
    sheetData: any[][], 
    headers: string[], 
    config: ForecastConfig
  ): Promise<ForecastResult> {
    
    // Parse the historical data
    const historicalData = this.parseHistoricalData(sheetData, headers, config)
    
    if (historicalData.length < 3) {
      throw new Error('Not enough historical data for forecasting. Need at least 3 data points.')
    }

    // Generate forecast based on algorithm
    let predictions: ForecastData[]
    let metrics: any
    let insights: string[]

    switch (config.algorithm) {
      case 'linear':
        ({ predictions, metrics, insights } = this.linearRegressionForecast(historicalData, config.forecastPeriods))
        break
      case 'exponential':
        ({ predictions, metrics, insights } = this.exponentialSmoothingForecast(historicalData, config.forecastPeriods))
        break
      case 'seasonal':
        ({ predictions, metrics, insights } = this.seasonalForecast(historicalData, config.forecastPeriods))
        break
      case 'moving_average':
        ({ predictions, metrics, insights } = this.movingAverageForecast(historicalData, config.forecastPeriods))
        break
      default:
        ({ predictions, metrics, insights } = this.linearRegressionForecast(historicalData, config.forecastPeriods))
    }

    const confidence = this.calculateConfidence(metrics.r2, metrics.mape)

    // Add Monte Carlo simulation if enabled
    let monteCarloResults: MonteCarloResults | undefined
    if (config.monteCarlo?.enabled) {
      monteCarloResults = this.runMonteCarloSimulation(
        historicalData,
        predictions,
        config.monteCarlo
      )
    }

    return {
      historicalData,
      predictions,
      confidence,
      algorithm: config.algorithm,
      metrics,
      insights,
      monteCarlo: monteCarloResults
    }
  }

  private parseHistoricalData(
    sheetData: any[][], 
    headers: string[], 
    config: ForecastConfig
  ): ForecastData[] {
    
    const timeIndex = this.findColumnIndex(headers, [config.timeColumn, 'quarter', 'period', 'date', 'fiscal_quarter'])
    const valueIndex = this.findColumnIndex(headers, [config.targetColumn, 'arr_usd', 'value', 'revenue'])
    
    if (timeIndex === -1 || valueIndex === -1) {
      throw new Error(`Could not find required columns: ${config.timeColumn} or ${config.targetColumn}`)
    }

    const data: ForecastData[] = []
    
    for (const row of sheetData) {
      if (row[timeIndex] && row[valueIndex]) {
        const period = row[timeIndex].toString()
        const value = parseFloat(row[valueIndex].toString().replace(/[,$]/g, ''))
        
        if (!isNaN(value)) {
          data.push({
            period,
            value,
            date: this.parsePeriodToDate(period)
          })
        }
      }
    }

    // Sort by date/period
    return data.sort((a, b) => {
      if (a.date && b.date) {
        return a.date.getTime() - b.date.getTime()
      }
      return a.period.localeCompare(b.period)
    })
  }

  private linearRegressionForecast(
    data: ForecastData[], 
    periods: number
  ): { predictions: ForecastData[], metrics: any, insights: string[] } {
    
    const n = data.length
    const x = data.map((_, i) => i)
    const y = data.map(d => d.value)

    // Calculate linear regression
    const { slope, intercept, r2 } = this.calculateLinearRegression(x, y)
    
    // Generate predictions
    const predictions: ForecastData[] = []
    for (let i = 0; i < periods; i++) {
      const futurePeriod = n + i
      const predictedValue = slope * futurePeriod + intercept
      const nextPeriod = this.generateNextPeriod(data[data.length - 1].period, i + 1)
      
      predictions.push({
        period: nextPeriod,
        value: Math.max(0, predictedValue) // Ensure non-negative values
      })
    }

    // Calculate MAPE
    const mape = this.calculateMAPE(data, x, slope, intercept)
    const trend = slope

    const insights = [
      `Linear trend shows ${slope > 0 ? 'growth' : 'decline'} of $${Math.abs(slope).toLocaleString()} per period`,
      `R² of ${(r2 * 100).toFixed(1)}% indicates ${r2 > 0.7 ? 'strong' : r2 > 0.4 ? 'moderate' : 'weak'} correlation`,
      `Mean Absolute Percentage Error: ${mape.toFixed(1)}%`,
      `Forecast confidence: ${this.calculateConfidence(r2, mape).toFixed(1)}%`
    ]

    return {
      predictions,
      metrics: { r2, mape, trend, seasonality: 0 },
      insights
    }
  }

  private exponentialSmoothingForecast(
    data: ForecastData[], 
    periods: number
  ): { predictions: ForecastData[], metrics: any, insights: string[] } {
    
    const alpha = 0.3 // Smoothing factor
    const values = data.map(d => d.value)
    
    // Simple exponential smoothing
    let smoothed = [values[0]]
    for (let i = 1; i < values.length; i++) {
      smoothed.push(alpha * values[i] + (1 - alpha) * smoothed[i - 1])
    }

    // Generate predictions
    const predictions: ForecastData[] = []
    const lastSmoothed = smoothed[smoothed.length - 1]
    
    for (let i = 0; i < periods; i++) {
      const nextPeriod = this.generateNextPeriod(data[data.length - 1].period, i + 1)
      predictions.push({
        period: nextPeriod,
        value: Math.max(0, lastSmoothed)
      })
    }

    // Calculate metrics
    const mape = this.calculateExponentialMAPE(values, smoothed)
    const r2 = this.calculateR2(values, smoothed)

    const insights = [
      `Exponential smoothing with α=${alpha} applied`,
      `Trend shows ${this.calculateTrend(smoothed) > 0 ? 'growth' : 'decline'} pattern`,
      `Mean Absolute Percentage Error: ${mape.toFixed(1)}%`,
      `Smoothing reduces noise by ${((1 - alpha) * 100).toFixed(1)}%`
    ]

    return {
      predictions,
      metrics: { r2, mape, trend: this.calculateTrend(smoothed), seasonality: 0 },
      insights
    }
  }

  private seasonalForecast(
    data: ForecastData[], 
    periods: number
  ): { predictions: ForecastData[], metrics: any, insights: string[] } {
    
    // Assume quarterly seasonality
    const seasonalPeriod = 4
    const values = data.map(d => d.value)
    
    if (values.length < seasonalPeriod * 2) {
      // Fall back to linear regression if not enough data
      return this.linearRegressionForecast(data, periods)
    }

    // Calculate seasonal indices
    const seasonalIndices = this.calculateSeasonalIndices(values, seasonalPeriod)
    
    // Deseasonalize data
    const deseasonalized = values.map((value, i) => {
      const seasonIndex = i % seasonalPeriod
      return value / seasonalIndices[seasonIndex]
    })

    // Apply linear trend to deseasonalized data
    const x = deseasonalized.map((_, i) => i)
    const { slope, intercept } = this.calculateLinearRegression(x, deseasonalized)

    // Generate predictions
    const predictions: ForecastData[] = []
    for (let i = 0; i < periods; i++) {
      const futureIndex = values.length + i
      const deseasonalizedValue = slope * futureIndex + intercept
      const seasonIndex = futureIndex % seasonalPeriod
      const seasonalValue = deseasonalizedValue * seasonalIndices[seasonIndex]
      const nextPeriod = this.generateNextPeriod(data[data.length - 1].period, i + 1)
      
      predictions.push({
        period: nextPeriod,
        value: Math.max(0, seasonalValue)
      })
    }

    const mape = this.calculateSeasonalMAPE(values, seasonalIndices, seasonalPeriod)
    const r2 = this.calculateSeasonalR2(values, seasonalIndices, seasonalPeriod)

    const insights = [
      `Seasonal forecast with ${seasonalPeriod}-period seasonality`,
      `Q1 seasonal factor: ${(seasonalIndices[0] * 100).toFixed(1)}%`,
      `Q2 seasonal factor: ${(seasonalIndices[1] * 100).toFixed(1)}%`,
      `Q3 seasonal factor: ${(seasonalIndices[2] * 100).toFixed(1)}%`,
      `Q4 seasonal factor: ${(seasonalIndices[3] * 100).toFixed(1)}%`,
      `Mean Absolute Percentage Error: ${mape.toFixed(1)}%`
    ]

    return {
      predictions,
      metrics: { r2, mape, trend: slope, seasonality: this.calculateSeasonality(seasonalIndices) },
      insights
    }
  }

  private movingAverageForecast(
    data: ForecastData[], 
    periods: number
  ): { predictions: ForecastData[], metrics: any, insights: string[] } {
    
    const window = Math.min(4, Math.floor(data.length / 2)) // Moving average window
    const values = data.map(d => d.value)
    
    // Calculate moving averages
    const movingAverages = []
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
      movingAverages.push(sum / window)
    }

    // Generate predictions
    const predictions: ForecastData[] = []
    const lastMA = movingAverages[movingAverages.length - 1]
    
    for (let i = 0; i < periods; i++) {
      const nextPeriod = this.generateNextPeriod(data[data.length - 1].period, i + 1)
      predictions.push({
        period: nextPeriod,
        value: Math.max(0, lastMA)
      })
    }

    const mape = this.calculateMovingAverageMAPE(values, movingAverages, window)
    const r2 = this.calculateMovingAverageR2(values, movingAverages, window)

    const insights = [
      `${window}-period moving average applied`,
      `Smoothed trend reduces volatility`,
      `Mean Absolute Percentage Error: ${mape.toFixed(1)}%`,
      `Best for stable, non-trending data`
    ]

    return {
      predictions,
      metrics: { r2, mape, trend: 0, seasonality: 0 },
      insights
    }
  }

  // Helper methods
  private findColumnIndex(headers: string[], possibleNames: string[]): number {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase() || ''
      for (const name of possibleNames) {
        if (header.includes(name.toLowerCase())) {
          return i
        }
      }
    }
    return -1
  }

  private parsePeriodToDate(period: string): Date {
    // Try to parse various period formats
    if (period.includes('Q1')) return new Date('2024-01-01')
    if (period.includes('Q2')) return new Date('2024-04-01')
    if (period.includes('Q3')) return new Date('2024-07-01')
    if (period.includes('Q4')) return new Date('2024-10-01')
    
    // Try to parse as date
    const date = new Date(period)
    if (!isNaN(date.getTime())) return date
    
    return new Date()
  }

  private generateNextPeriod(currentPeriod: string, offset: number): string {
    // Generate next period based on current period format
    if (currentPeriod.includes('Q1')) return `Q${(1 + offset - 1) % 4 + 1}`
    if (currentPeriod.includes('Q2')) return `Q${(2 + offset - 1) % 4 + 1}`
    if (currentPeriod.includes('Q3')) return `Q${(3 + offset - 1) % 4 + 1}`
    if (currentPeriod.includes('Q4')) return `Q${(4 + offset - 1) % 4 + 1}`
    
    return `${parseInt(currentPeriod) + offset}`
  }

  private calculateLinearRegression(x: number[], y: number[]): { slope: number, intercept: number, r2: number } {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const yMean = sumY / n
    const ssRes = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept
      return sum + Math.pow(yi - predicted, 2)
    }, 0)
    const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const r2 = 1 - (ssRes / ssTot)

    return { slope, intercept, r2 }
  }

  private calculateMAPE(actual: ForecastData[], x: number[], slope: number, intercept: number): number {
    const errors = actual.map((data, i) => {
      const predicted = slope * x[i] + intercept
      return Math.abs((data.value - predicted) / data.value) * 100
    })
    return errors.reduce((sum, error) => sum + error, 0) / errors.length
  }

  private calculateR2(actual: number[], predicted: number[]): number {
    const actualMean = actual.reduce((sum, val) => sum + val, 0) / actual.length
    const ssRes = actual.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0)
    const ssTot = actual.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0)
    return 1 - (ssRes / ssTot)
  }

  private calculateConfidence(r2: number, mape: number): number {
    const r2Score = Math.max(0, r2 * 100)
    const mapeScore = Math.max(0, 100 - mape)
    return (r2Score + mapeScore) / 2
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0
    return (values[values.length - 1] - values[0]) / values.length
  }

  private calculateSeasonalIndices(values: number[], period: number): number[] {
    const indices = new Array(period).fill(0)
    const counts = new Array(period).fill(0)
    
    values.forEach((value, i) => {
      const seasonIndex = i % period
      indices[seasonIndex] += value
      counts[seasonIndex]++
    })

    const average = values.reduce((sum, val) => sum + val, 0) / values.length
    
    return indices.map((sum, i) => (sum / counts[i]) / average)
  }

  private calculateSeasonalMAPE(values: number[], indices: number[], period: number): number {
    const errors = values.map((value, i) => {
      const seasonIndex = i % period
      const predicted = value / indices[seasonIndex] * indices[seasonIndex]
      return Math.abs((value - predicted) / value) * 100
    })
    return errors.reduce((sum, error) => sum + error, 0) / errors.length
  }

  private calculateSeasonalR2(values: number[], indices: number[], period: number): number {
    const actualMean = values.reduce((sum, val) => sum + val, 0) / values.length
    const predicted = values.map((value, i) => {
      const seasonIndex = i % period
      return value / indices[seasonIndex] * indices[seasonIndex]
    })
    
    const ssRes = values.reduce((sum, val, i) => sum + Math.pow(val - predicted[i], 2), 0)
    const ssTot = values.reduce((sum, val) => sum + Math.pow(val - actualMean, 2), 0)
    return 1 - (ssRes / ssTot)
  }

  private calculateSeasonality(indices: number[]): number {
    const max = Math.max(...indices)
    const min = Math.min(...indices)
    return (max - min) / ((max + min) / 2)
  }

  private calculateExponentialMAPE(actual: number[], smoothed: number[]): number {
    const errors = actual.slice(1).map((value, i) => {
      return Math.abs((value - smoothed[i + 1]) / value) * 100
    })
    return errors.reduce((sum, error) => sum + error, 0) / errors.length
  }

  private calculateMovingAverageMAPE(actual: number[], ma: number[], window: number): number {
    const errors = actual.slice(window - 1).map((value, i) => {
      return Math.abs((value - ma[i]) / value) * 100
    })
    return errors.reduce((sum, error) => sum + error, 0) / errors.length
  }

  private calculateMovingAverageR2(actual: number[], ma: number[], window: number): number {
    const actualValues = actual.slice(window - 1)
    return this.calculateR2(actualValues, ma)
  }

  // Monte Carlo Simulation Methods
  private runMonteCarloSimulation(
    historicalData: ForecastData[],
    basePredictions: ForecastData[],
    config: { simulations: number; volatilityFactor: number; driftFactor: number }
  ): MonteCarloResults {
    
    const { simulations, volatilityFactor, driftFactor } = config
    const historicalValues = historicalData.map(d => d.value)
    const lastValue = historicalValues[historicalValues.length - 1]
    
    // Calculate historical volatility and drift
    const volatility = this.calculateHistoricalVolatility(historicalValues) * volatilityFactor
    const drift = this.calculateHistoricalDrift(historicalValues) * driftFactor
    
    // Run simulations
    const simulationResults: number[][] = []
    
    for (let sim = 0; sim < simulations; sim++) {
      const simulation = this.runSingleSimulation(
        lastValue,
        basePredictions,
        volatility,
        drift
      )
      simulationResults.push(simulation)
    }
    
    // Calculate percentiles for each time period
    const percentiles = this.calculatePercentiles(simulationResults, basePredictions)
    
    // Calculate risk metrics
    const riskMetrics = this.calculateRiskMetrics(simulationResults, lastValue)
    
    // Generate scenario forecasts
    const scenarios = this.generateScenarios(basePredictions, percentiles)
    
    return {
      simulations,
      percentiles,
      riskMetrics,
      scenarios
    }
  }

  private runSingleSimulation(
    startingValue: number,
    basePredictions: ForecastData[],
    volatility: number,
    drift: number
  ): number[] {
    
    const simulation: number[] = []
    let currentValue = startingValue
    
    for (let i = 0; i < basePredictions.length; i++) {
      // Geometric Brownian Motion for financial modeling
      const dt = 1 // Time step (1 period)
      const randomShock = this.generateNormalRandom() * Math.sqrt(dt)
      
      // Apply drift and volatility
      const change = (drift * dt) + (volatility * randomShock)
      currentValue = currentValue * Math.exp(change)
      
      // Ensure non-negative values
      currentValue = Math.max(0, currentValue)
      simulation.push(currentValue)
    }
    
    return simulation
  }

  private calculateHistoricalVolatility(values: number[]): number {
    if (values.length < 2) return 0.1 // Default 10% volatility
    
    const returns = []
    for (let i = 1; i < values.length; i++) {
      if (values[i - 1] > 0) {
        returns.push(Math.log(values[i] / values[i - 1]))
      }
    }
    
    if (returns.length === 0) return 0.1
    
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    
    return Math.sqrt(variance)
  }

  private calculateHistoricalDrift(values: number[]): number {
    if (values.length < 2) return 0.05 // Default 5% drift
    
    const firstValue = values[0]
    const lastValue = values[values.length - 1]
    const periods = values.length - 1
    
    if (firstValue <= 0) return 0.05
    
    return Math.log(lastValue / firstValue) / periods
  }

  private generateNormalRandom(): number {
    // Box-Muller transform for generating normal random numbers
    let u1 = Math.random()
    let u2 = Math.random()
    
    // Avoid log(0)
    if (u1 === 0) u1 = 0.0001
    if (u2 === 0) u2 = 0.0001
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z0
  }

  private calculatePercentiles(
    simulationResults: number[][],
    basePredictions: ForecastData[]
  ): MonteCarloResults['percentiles'] {
    
    const percentiles: MonteCarloResults['percentiles'] = {
      p10: [],
      p25: [],
      p50: [],
      p75: [],
      p90: []
    }
    
    // For each time period, calculate percentiles across all simulations
    for (let period = 0; period < basePredictions.length; period++) {
      const periodValues = simulationResults.map(sim => sim[period]).sort((a, b) => a - b)
      const n = periodValues.length
      
      const nextPeriod = this.generateNextPeriod(basePredictions[0].period, period + 1)
      
      percentiles.p10.push({ period: nextPeriod, value: periodValues[Math.floor(n * 0.1)] })
      percentiles.p25.push({ period: nextPeriod, value: periodValues[Math.floor(n * 0.25)] })
      percentiles.p50.push({ period: nextPeriod, value: periodValues[Math.floor(n * 0.5)] })
      percentiles.p75.push({ period: nextPeriod, value: periodValues[Math.floor(n * 0.75)] })
      percentiles.p90.push({ period: nextPeriod, value: periodValues[Math.floor(n * 0.9)] })
    }
    
    return percentiles
  }

  private calculateRiskMetrics(
    simulationResults: number[][],
    startingValue: number
  ): MonteCarloResults['riskMetrics'] {
    
    const finalValues = simulationResults.map(sim => sim[sim.length - 1])
    const returns = finalValues.map(value => (value - startingValue) / startingValue)
    
    // Sort returns for percentile calculations
    returns.sort((a, b) => a - b)
    
    // Value at Risk (VaR) - 95% confidence level
    const varIndex = Math.floor(returns.length * 0.05)
    const valueAtRisk95 = returns[varIndex]
    
    // Expected Shortfall (Conditional VaR)
    const tailReturns = returns.slice(0, varIndex + 1)
    const expectedShortfall = tailReturns.reduce((sum, r) => sum + r, 0) / tailReturns.length
    
    // Probability of Loss
    const probabilityOfLoss = returns.filter(r => r < 0).length / returns.length
    
    // Maximum Drawdown
    let maxDrawdown = 0
    simulationResults.forEach(simulation => {
      let peak = simulation[0]
      let maxDD = 0
      
      for (let i = 1; i < simulation.length; i++) {
        if (simulation[i] > peak) {
          peak = simulation[i]
        } else {
          const drawdown = (peak - simulation[i]) / peak
          maxDD = Math.max(maxDD, drawdown)
        }
      }
      
      maxDrawdown = Math.max(maxDrawdown, maxDD)
    })
    
    return {
      valueAtRisk95,
      expectedShortfall,
      probabilityOfLoss,
      maxDrawdown
    }
  }

  private generateScenarios(
    basePredictions: ForecastData[],
    percentiles: MonteCarloResults['percentiles']
  ): MonteCarloResults['scenarios'] {
    
    return {
      optimistic: percentiles.p90,
      realistic: percentiles.p50,
      pessimistic: percentiles.p10
    }
  }
}

// Create a singleton instance
export const forecastService = new ForecastService()
