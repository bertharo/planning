import { NextRequest, NextResponse } from 'next/server'
import { googleSheetsService } from '@/lib/googleSheets'

export async function POST(req: NextRequest) {
  try {
    console.log('API route called')
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' }, 
        { status: 400 }
      )
    }

    // Try to use the LRP Copilot Google Sheets model first
    try {
      const lrpCopilotResult = await handleLRPCopilotScenario(prompt)
      if (lrpCopilotResult) {
        console.log('Using LRP Copilot Google Sheets model')
        return lrpCopilotResult
      }
    } catch (error) {
      console.log('LRP Copilot model not available, falling back to mock responses:', error)
    }

    // Check if we should use mock responses (only if Apps Script is not available)
    const useMockResponses = process.env.USE_MOCK_SCENARIOS === 'true'
    
    if (useMockResponses) {
      // Check for different scenario types for mock responses
      const isChurnReduction = /reduce.*churn.*(\d+)\%/i.test(prompt)
      const isARRIncrease = /increase.*arr.*\$?(\d+[km]?)/i.test(prompt)
      const isPricingChange = /(increase|decrease|optimize).*pricing.*(\d+)\%/i.test(prompt)
      const isHeadcountChange = /(hire|add|reduce).*\d+.*(employee|engineer|sales|staff)/i.test(prompt)
      
      if (isChurnReduction) {
        console.log('Using mock churn reduction scenario')
        return handleChurnReductionScenario(prompt)
      } else if (isARRIncrease) {
        console.log('Using mock ARR increase scenario')
        return handleARRIncreaseScenario(prompt)
      } else if (isPricingChange) {
        console.log('Using mock pricing change scenario')
        return handlePricingChangeScenario(prompt)
      } else if (isHeadcountChange) {
        console.log('Using mock headcount change scenario')
        return handleHeadcountChangeScenario(prompt)
      }
    }

    const gasUrl = process.env.GAS_URL
    const gasKey = process.env.GAS_KEY

    console.log('GAS_URL:', gasUrl)
    console.log('GAS_KEY:', gasKey ? 'Set' : 'Not set')

    if (!gasUrl || !gasKey) {
      return NextResponse.json(
        { error: 'Apps Script configuration missing' }, 
        { status: 500 }
      )
    }

    const url = `${gasUrl}?key=${gasKey}`
    console.log('Calling Apps Script:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    const data = await response.json()
    console.log('Apps Script response:', data)

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Apps Script error' }, 
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error running scenario:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

function handleChurnReductionScenario(prompt: string) {
  // Extract churn reduction percentage
  const churnMatch = prompt.match(/reduce.*churn.*(\d+)\%/i)
  const churnReduction = churnMatch ? parseInt(churnMatch[1]) : 2
  
  // Mock current ARR (you can adjust this based on your actual data)
  const currentARR = 125500000
  
  // Calculate ARR impact of churn reduction
  // Assuming 10% annual churn rate, reducing by 2% means 8% churn
  // This would retain more customers, increasing ARR
  const churnRateReduction = churnReduction / 100
  const retainedRevenueImpact = currentARR * churnRateReduction * 0.8 // 80% of churn reduction translates to revenue retention
  
  const arrAfter = Math.round(currentARR + retainedRevenueImpact)
  const arrDelta = Math.round(retainedRevenueImpact)
  
  const runId = `RUN_${Date.now()}`
  
  // Generate dynamic narrative based on scenario specifics
  const narrative = generateChurnReductionNarrative(prompt, churnReduction, currentARR, arrDelta)

  return NextResponse.json({
    run_id: runId,
    prompt: prompt,
    arr_before: currentARR,
    arr_after: arrAfter,
    arr_delta: arrDelta,
    caps: [],
    narrative: narrative
  })
}

function generateChurnReductionNarrative(prompt: string, churnReduction: number, currentARR: number, arrDelta: number) {
  // Determine scope from prompt
  const isAllProducts = /all products/i.test(prompt)
  const isSpecificProduct = /product.*\b(core|enterprise|smb|platform|suite|package)\b/i.test(prompt)
  const isRegionSpecific = /region.*\b(emea|apac|americas|north america|europe|asia)\b/i.test(prompt)
  
  // Determine timeframe if mentioned
  const hasTimeframe = /quarterly|annual|monthly|q[1-4]|2024|2025/i.test(prompt)
  
  // Calculate growth rate
  const growthRate = ((currentARR + arrDelta) / currentARR - 1) * 100
  
  let narrative = `Scenario Analysis: "${prompt}"\n\n`
  
  // Context section
  if (isAllProducts) {
    narrative += `This comprehensive churn reduction initiative targets all product lines across the organization. `
  } else if (isSpecificProduct) {
    narrative += `This targeted churn reduction strategy focuses on specific product segments. `
  } else {
    narrative += `This churn reduction strategy addresses customer retention across our portfolio. `
  }
  
  // Impact section
  narrative += `The ${churnReduction}% reduction in customer churn rate translates to significant revenue retention benefits.\n\n`
  
  narrative += `Financial Impact:\n`
  narrative += `• Current ARR: $${currentARR.toLocaleString()}\n`
  narrative += `• ARR Increase: $${arrDelta.toLocaleString()}\n`
  narrative += `• Growth Rate: ${growthRate.toFixed(1)}%\n`
  narrative += `• Churn Reduction: ${churnReduction} percentage points\n\n`
  
  // Strategic implications
  narrative += `Strategic Implications:\n`
  if (churnReduction >= 3) {
    narrative += `• Significant competitive advantage through improved customer loyalty\n`
    narrative += `• Enhanced customer lifetime value and reduced acquisition costs\n`
  } else {
    narrative += `• Measurable improvement in customer retention metrics\n`
    narrative += `• Positive impact on revenue stability and predictability\n`
  }
  
  narrative += `• Improved customer satisfaction scores and reduced support costs\n`
  narrative += `• Enhanced market position through better customer advocacy\n\n`
  
  // Implementation notes
  if (hasTimeframe) {
    narrative += `Implementation Timeline: This reduction should be achievable within the specified timeframe through targeted retention programs.\n\n`
  }
  
  // Risk considerations
  if (arrDelta > 5000000) {
    narrative += `Risk Assessment: Large ARR impact requires careful change management and customer communication strategies.\n\n`
  }
  
  narrative += `Recommendation: Proceed with implementation of customer retention initiatives to achieve the projected ${churnReduction}% churn reduction target.`
  
  return narrative
}

function handleARRIncreaseScenario(prompt: string) {
  const arrMatch = prompt.match(/increase.*arr.*\$?(\d+[km]?)/i)
  let arrIncrease = 10000000 // Default $10M
  
  if (arrMatch) {
    const value = arrMatch[1].toLowerCase()
    if (value.includes('k')) {
      arrIncrease = parseInt(value.replace('k', '')) * 1000
    } else if (value.includes('m')) {
      arrIncrease = parseInt(value.replace('m', '')) * 1000000
    } else {
      arrIncrease = parseInt(value) * 1000000 // Assume millions if no suffix
    }
  }
  
  const currentARR = 125500000
  const arrAfter = currentARR + arrIncrease
  const runId = `RUN_${Date.now()}`
  
  const narrative = generateARRIncreaseNarrative(prompt, arrIncrease, currentARR, arrAfter)
  
  return NextResponse.json({
    run_id: runId,
    prompt: prompt,
    arr_before: currentARR,
    arr_after: arrAfter,
    arr_delta: arrIncrease,
    caps: [],
    narrative: narrative
  })
}

function handlePricingChangeScenario(prompt: string) {
  const pricingMatch = prompt.match(/(increase|decrease|optimize).*pricing.*(\d+)\%/i)
  const direction = pricingMatch ? pricingMatch[1] : 'increase'
  const percentage = pricingMatch ? parseInt(pricingMatch[2]) : 10
  
  const currentARR = 125500000
  const priceImpact = currentARR * (percentage / 100) * (direction === 'increase' ? 1 : -1)
  const arrAfter = Math.round(currentARR + priceImpact)
  const runId = `RUN_${Date.now()}`
  
  const narrative = generatePricingChangeNarrative(prompt, direction, percentage, currentARR, priceImpact)
  
  return NextResponse.json({
    run_id: runId,
    prompt: prompt,
    arr_before: currentARR,
    arr_after: arrAfter,
    arr_delta: Math.round(priceImpact),
    caps: [],
    narrative: narrative
  })
}

function handleHeadcountChangeScenario(prompt: string) {
  const headcountMatch = prompt.match(/(hire|add|reduce).*?(\d+).*(employee|engineer|sales|staff)/i)
  const action = headcountMatch ? headcountMatch[1] : 'hire'
  const count = headcountMatch ? parseInt(headcountMatch[2]) : 10
  const role = headcountMatch ? headcountMatch[3] : 'employee'
  
  const currentARR = 125500000
  // Assume each hire adds $500K ARR potential, reduction removes $300K
  const arrImpact = action === 'hire' ? count * 500000 : -(count * 300000)
  const arrAfter = Math.round(currentARR + arrImpact)
  const runId = `RUN_${Date.now()}`
  
  const narrative = generateHeadcountChangeNarrative(prompt, action, count, role, currentARR, arrImpact)
  
  return NextResponse.json({
    run_id: runId,
    prompt: prompt,
    arr_before: currentARR,
    arr_after: arrAfter,
    arr_delta: Math.round(arrImpact),
    caps: [],
    narrative: narrative
  })
}

function generateARRIncreaseNarrative(prompt: string, arrIncrease: number, currentARR: number, arrAfter: number) {
  const growthRate = ((arrAfter / currentARR) - 1) * 100
  
  let narrative = `Scenario Analysis: "${prompt}"\n\n`
  narrative += `This growth initiative targets a significant increase in Annual Recurring Revenue through strategic expansion efforts.\n\n`
  
  narrative += `Financial Impact:\n`
  narrative += `• Current ARR: $${currentARR.toLocaleString()}\n`
  narrative += `• ARR Increase: $${arrIncrease.toLocaleString()}\n`
  narrative += `• New ARR Target: $${arrAfter.toLocaleString()}\n`
  narrative += `• Growth Rate: ${growthRate.toFixed(1)}%\n\n`
  
  narrative += `Strategic Implications:\n`
  narrative += `• Accelerated market penetration and customer acquisition\n`
  narrative += `• Enhanced competitive positioning in target segments\n`
  narrative += `• Increased operational capacity requirements\n`
  narrative += `• Potential need for infrastructure scaling\n\n`
  
  if (growthRate > 20) {
    narrative += `Risk Assessment: High growth rate requires careful operational planning and resource allocation.\n\n`
  }
  
  narrative += `Recommendation: Proceed with aggressive growth initiatives while ensuring operational scalability.`
  
  return narrative
}

function generatePricingChangeNarrative(prompt: string, direction: string, percentage: number, currentARR: number, priceImpact: number) {
  const growthRate = ((currentARR + priceImpact) / currentARR - 1) * 100
  
  let narrative = `Scenario Analysis: "${prompt}"\n\n`
  narrative += `This pricing optimization strategy ${direction}s pricing by ${percentage}% to ${direction === 'increase' ? 'maximize revenue potential' : 'improve market competitiveness'}.\n\n`
  
  narrative += `Financial Impact:\n`
  narrative += `• Current ARR: $${currentARR.toLocaleString()}\n`
  narrative += `• Price Impact: $${Math.round(priceImpact).toLocaleString()}\n`
  narrative += `• Growth Rate: ${growthRate.toFixed(1)}%\n\n`
  
  narrative += `Strategic Implications:\n`
  if (direction === 'increase') {
    narrative += `• Improved revenue per customer and margin expansion\n`
    narrative += `• Potential market share impact requiring competitive analysis\n`
    narrative += `• Enhanced value proposition communication needs\n`
  } else {
    narrative += `• Improved market competitiveness and customer acquisition\n`
    narrative += `• Margin compression requiring operational efficiency gains\n`
    narrative += `• Potential volume growth offsetting price reduction\n`
  }
  narrative += `• Customer satisfaction and retention considerations\n\n`
  
  narrative += `Risk Assessment: Pricing changes require careful customer communication and competitive positioning.\n\n`
  narrative += `Recommendation: Implement pricing strategy with comprehensive market analysis and customer feedback integration.`
  
  return narrative
}

function generateHeadcountChangeNarrative(prompt: string, action: string, count: number, role: string, currentARR: number, arrImpact: number) {
  const growthRate = ((currentARR + arrImpact) / currentARR - 1) * 100
  
  let narrative = `Scenario Analysis: "${prompt}"\n\n`
  narrative += `This ${action === 'hire' ? 'hiring' : 'workforce reduction'} initiative ${action}s ${count} ${role}${count > 1 ? 's' : ''} to ${action === 'hire' ? 'support business growth' : 'optimize operational efficiency'}.\n\n`
  
  narrative += `Financial Impact:\n`
  narrative += `• Current ARR: $${currentARR.toLocaleString()}\n`
  narrative += `• ARR Impact: $${Math.round(arrImpact).toLocaleString()}\n`
  narrative += `• Growth Rate: ${growthRate.toFixed(1)}%\n\n`
  
  narrative += `Strategic Implications:\n`
  if (action === 'hire') {
    narrative += `• Enhanced capacity for customer acquisition and support\n`
    narrative += `• Increased operational overhead and management complexity\n`
    narrative += `• Improved innovation and product development capabilities\n`
  } else {
    narrative += `• Reduced operational costs and improved efficiency\n`
    narrative += `• Potential impact on customer service and product quality\n`
    narrative += `• Streamlined operations and faster decision-making\n`
  }
  narrative += `• Talent acquisition and retention considerations\n\n`
  
  narrative += `Risk Assessment: ${action === 'hire' ? 'Hiring' : 'Workforce reduction'} requires careful onboarding and change management processes.\n\n`
  narrative += `Recommendation: Proceed with ${action === 'hire' ? 'strategic hiring' : 'workforce optimization'} while ensuring operational continuity.`
  
  return narrative
}

async function handleLRPCopilotScenario(prompt: string) {
  try {
    const gasUrl = process.env.GAS_URL
    const gasKey = process.env.GAS_KEY

    if (!gasUrl || !gasKey) {
      console.log('Apps Script configuration missing')
      return null
    }

    const url = `${gasUrl}?key=${gasKey}`
    console.log('Calling LRP Copilot Apps Script:', url)
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      console.log('Apps Script not available:', response.status)
      return null
    }

    const data = await response.json()
    console.log('LRP Copilot response:', data)

    // Transform the response to match expected format
    return NextResponse.json({
      run_id: data.runId || data.run_id,
      prompt: data.prompt,
      arr_before: data.before?.ARR || data.arr_before,
      arr_after: data.after?.ARR || data.arr_after,
      arr_delta: data.delta?.ARR || data.arr_delta,
      caps: data.constraintViolations || [],
      narrative: data.narrative || 'Scenario completed successfully',
      vwDeltas: data.vwDeltas || []
    })

  } catch (error) {
    console.log('LRP Copilot error:', error)
    return null
  }
}