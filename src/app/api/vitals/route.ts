import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Web Vitals API endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || 'unknown'
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'

    // Validate required fields
    if (!body.name || typeof body.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid metric data' },
        { status: 400 }
      )
    }

    // Prepare metric data
    const metric = {
      name: body.name,
      value: body.value,
      id: body.id,
      delta: body.delta,
      navigationType: body.navigationType,
      timestamp: body.timestamp || Date.now(),
      url: body.url,
      userAgent,
      ip: ip.split(',')[0].trim(), // Get first IP if multiple
      sessionId: body.sessionId,
      rating: getRating(body.name, body.value)
    }

    // Log metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital Received:', metric)
    }

    // Store or forward metrics to analytics services
    await Promise.allSettled([
      sendToVercelAnalytics(metric),
      sendToGoogleAnalytics(metric),
      sendToCustomEndpoint(metric),
      storeInDatabase(metric)
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing vitals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Rate Web Vitals metrics
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    FID: [100, 300],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800]
  }

  const [good, poor] = thresholds[name] || [0, 0]
  
  if (value <= good) return 'good'
  if (value <= poor) return 'needs-improvement'
  return 'poor'
}

// Send to Vercel Analytics
async function sendToVercelAnalytics(metric: any) {
  if (!process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID) return

  try {
    await fetch('https://vitals.vercel-insights.com/v1/vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VERCEL_ANALYTICS_TOKEN}`
      },
      body: JSON.stringify({
        dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
        id: metric.id,
        page: metric.url,
        href: metric.url,
        event_name: metric.name,
        value: metric.value,
        speed: metric.navigationType
      })
    })
  } catch (error) {
    console.error('Failed to send to Vercel Analytics:', error)
  }
}

// Send to Google Analytics
async function sendToGoogleAnalytics(metric: any) {
  if (!process.env.GOOGLE_ANALYTICS_ID) return

  try {
    const params = new URLSearchParams({
      v: '1', // Version
      tid: process.env.GOOGLE_ANALYTICS_ID,
      cid: metric.id, // Client ID
      t: 'event', // Hit Type
      ec: 'Web Vitals', // Event Category
      ea: metric.name, // Event Action
      el: metric.rating, // Event Label
      ev: Math.round(metric.value).toString(), // Event Value
      ni: '1' // Non-Interaction Event
    })

    await fetch('https://www.google-analytics.com/collect', {
      method: 'POST',
      body: params
    })
  } catch (error) {
    console.error('Failed to send to Google Analytics:', error)
  }
}

// Send to custom analytics endpoint
async function sendToCustomEndpoint(metric: any) {
  if (!process.env.CUSTOM_ANALYTICS_ENDPOINT) return

  try {
    await fetch(process.env.CUSTOM_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CUSTOM_ANALYTICS_TOKEN}`
      },
      body: JSON.stringify({
        type: 'web_vital',
        metric,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('Failed to send to custom endpoint:', error)
  }
}

// Store in database (implement based on your database choice)
async function storeInDatabase(metric: any) {
  if (!process.env.DATABASE_URL) return

  try {
    // Example using a generic database client
    // Replace with your actual database implementation
    
    // const db = await connectToDatabase()
    // await db.collection('web_vitals').insertOne({
    //   ...metric,
    //   createdAt: new Date()
    // })
    
    console.log('Metric stored in database:', metric.name)
  } catch (error) {
    console.error('Failed to store in database:', error)
  }
}

// GET endpoint for retrieving metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Implement metrics retrieval logic
    const metrics = await getMetricsFromDatabase({
      metric,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    })

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error retrieving metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Placeholder for metrics retrieval
async function getMetricsFromDatabase(filters: {
  metric?: string | null
  startDate?: Date
  endDate?: Date
}) {
  // Implement your database query logic here
  return {
    metrics: [],
    summary: {
      count: 0,
      averages: {},
      ratings: {}
    }
  }
}