import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt' }, 
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

    const url = `${gasUrl}?key=${gasKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    const data = await response.json()

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
