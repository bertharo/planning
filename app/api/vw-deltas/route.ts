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
