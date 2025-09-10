import { NextRequest, NextResponse } from 'next/server'
import { contactService, getClientIP, getUserAgent } from '@/lib/contact-service'
import type { ContactForm } from '@/types'

// Enable CORS for contact form submissions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    const formData: ContactForm = body

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Get client information for security
    const clientIP = getClientIP(request)
    const userAgent = getUserAgent(request)

    // Submit form using contact service
    const result = await contactService.submitContactForm(formData, {
      clientIP,
      userAgent,
      sendEmail: true
    })

    // Return appropriate response
    if (result.success) {
      return NextResponse.json(result, { 
        status: 200, 
        headers: corsHeaders 
      })
    } else {
      return NextResponse.json(result, { 
        status: 400, 
        headers: corsHeaders 
      })
    }
  } catch (error) {
    console.error('Contact API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error. Please try again later.' 
      },
      { 
        status: 500, 
        headers: corsHeaders 
      }
    )
  }
}

// Optional: GET endpoint for admin purposes (protected)
export async function GET(request: NextRequest) {
  try {
    // In a real application, you'd check authentication here
    const url = new URL(request.url)
    const action = url.searchParams.get('action')
    
    if (action === 'stats') {
      const stats = await contactService.getSubmissionStats()
      return NextResponse.json(stats, { headers: corsHeaders })
    }
    
    if (action === 'recent') {
      const limit = parseInt(url.searchParams.get('limit') || '10')
      const submissions = await contactService.getRecentSubmissions(limit)
      return NextResponse.json(submissions, { headers: corsHeaders })
    }
    
    return NextResponse.json(
      { message: 'Contact API endpoint' },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Contact API GET error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}