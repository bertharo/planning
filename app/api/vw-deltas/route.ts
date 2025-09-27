import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const run_id = searchParams.get('run_id')

    if (!run_id) {
      return NextResponse.json(
        { error: 'Missing run_id' }, 
        { status: 400 }
      )
    }

    // Check if we should use mock responses
    const useMockResponses = process.env.USE_MOCK_SCENARIOS === 'true'
    
    if (useMockResponses && run_id.startsWith('RUN_') && run_id.length > 20) {
      console.log('Using mock VW deltas for scenario:', run_id)
      return handleMockVWDeltas(run_id)
    }

    const gasUrl = process.env.GAS_URL
    const gasKey = process.env.GAS_KEY

    if (!gasUrl || !gasKey) {
      return NextResponse.json(
        { error: 'Apps Script configuration missing' }, 
        { status: 500 }
      )
    }

    const url = `${gasUrl}?resource=vw_deltas&run_id=${encodeURIComponent(run_id)}&key=${gasKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Apps Script error' }, 
        { status: response.status }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching VW deltas:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

function handleMockVWDeltas(run_id: string) {
  const mockDeltas = [
    {
      RUN_ID: run_id,
      metric: 'ARR',
      scope_type: 'product',
      scope_val: 'Core Platform',
      before: 75000000,
      after: 76000000,
      delta: 1000000,
      unit: 'USD'
    },
    {
      RUN_ID: run_id,
      metric: 'ARR',
      scope_type: 'product',
      scope_val: 'Enterprise Suite',
      before: 35000000,
      after: 35700000,
      delta: 700000,
      unit: 'USD'
    },
    {
      RUN_ID: run_id,
      metric: 'ARR',
      scope_type: 'product',
      scope_val: 'SMB Package',
      before: 15500000,
      after: 15800000,
      delta: 300000,
      unit: 'USD'
    },
    {
      RUN_ID: run_id,
      metric: 'Churn Rate',
      scope_type: 'product',
      scope_val: 'Core Platform',
      before: 0.08,
      after: 0.06,
      delta: -0.02,
      unit: 'percentage'
    },
    {
      RUN_ID: run_id,
      metric: 'Churn Rate',
      scope_type: 'product',
      scope_val: 'Enterprise Suite',
      before: 0.06,
      after: 0.04,
      delta: -0.02,
      unit: 'percentage'
    },
    {
      RUN_ID: run_id,
      metric: 'Churn Rate',
      scope_type: 'product',
      scope_val: 'SMB Package',
      before: 0.12,
      after: 0.10,
      delta: -0.02,
      unit: 'percentage'
    }
  ]

  return NextResponse.json({
    ok: true,
    run_id: run_id,
    rows: mockDeltas
  })
}
