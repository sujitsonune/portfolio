import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { ContactForm, ContactSubmission } from '@/types'

// Email service integration (you'll need to set this up with your preferred service)
interface EmailServiceConfig {
  apiKey: string
  templateId: string
  serviceId: string
  userId: string
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxSubmissions: 5, // Maximum submissions per time window
  timeWindow: 60 * 60 * 1000, // 1 hour in milliseconds
  blockDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
}

// Spam detection patterns
const SPAM_PATTERNS = [
  /\b(?:buy now|click here|free money|make money fast|get rich quick|work from home)\b/i,
  /\b(?:viagra|cialis|pharmacy|casino|poker|gambling|lottery|winner)\b/i,
  /\b(?:weight loss|diet pills|muscle building|penis enlargement)\b/i,
  /(https?:\/\/[^\s]+){3,}/g, // Multiple URLs
  /(.)\1{10,}/g, // Repeated characters
  /[A-Z]{20,}/g, // Long strings of capital letters
]

// Email validation
const EMAIL_VALIDATION = {
  regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  maxLength: 254,
  disposableEmails: [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com'
  ]
}

export class ContactService {
  private static instance: ContactService
  private emailConfig: EmailServiceConfig | null = null

  constructor() {
    // Initialize email service configuration from environment variables
    this.emailConfig = {
      apiKey: process.env.NEXT_PUBLIC_EMAILJS_API_KEY || '',
      templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
      serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
      userId: process.env.NEXT_PUBLIC_EMAILJS_USER_ID || ''
    }
  }

  static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService()
    }
    return ContactService.instance
  }

  // Validate form data with comprehensive checks
  private async validateFormData(formData: ContactForm, clientIP?: string): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Basic field validation
    if (!formData.name?.trim() || formData.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long')
    }

    if (formData.name && formData.name.length > 100) {
      errors.push('Name must be less than 100 characters')
    }

    // Email validation
    if (!formData.email?.trim()) {
      errors.push('Email is required')
    } else {
      if (!EMAIL_VALIDATION.regex.test(formData.email)) {
        errors.push('Invalid email format')
      }

      if (formData.email.length > EMAIL_VALIDATION.maxLength) {
        errors.push('Email address is too long')
      }

      // Check for disposable email domains
      const emailDomain = formData.email.split('@')[1]?.toLowerCase()
      if (emailDomain && EMAIL_VALIDATION.disposableEmails.includes(emailDomain)) {
        errors.push('Please use a permanent email address')
      }
    }

    // Subject validation
    if (!formData.subject?.trim() || formData.subject.trim().length < 5) {
      errors.push('Subject must be at least 5 characters long')
    }

    if (formData.subject && formData.subject.length > 200) {
      errors.push('Subject must be less than 200 characters')
    }

    // Message validation
    if (!formData.message?.trim() || formData.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long')
    }

    if (formData.message && formData.message.length > 5000) {
      errors.push('Message must be less than 5000 characters')
    }

    // Honeypot check
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      errors.push('Spam detected')
    }

    // Spam pattern detection
    const fullText = `${formData.name} ${formData.email} ${formData.subject} ${formData.message}`.toLowerCase()
    
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(fullText)) {
        errors.push('Message contains suspicious content')
        break
      }
    }

    // Rate limiting check
    if (clientIP) {
      const rateLimitCheck = await this.checkRateLimit(clientIP, formData.email)
      if (!rateLimitCheck.allowed) {
        errors.push(rateLimitCheck.message)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Check rate limiting for IP and email
  private async checkRateLimit(clientIP: string, email: string): Promise<{ allowed: boolean; message: string }> {
    try {
      const now = Date.now()
      const timeWindowStart = now - RATE_LIMIT.timeWindow

      // Check submissions from this IP
      const ipQuery = query(
        collection(db, 'contactSubmissions'),
        where('clientIP', '==', clientIP),
        where('timestamp', '>', Timestamp.fromMillis(timeWindowStart)),
        orderBy('timestamp', 'desc')
      )

      const ipSubmissions = await getDocs(ipQuery)
      
      if (ipSubmissions.size >= RATE_LIMIT.maxSubmissions) {
        return {
          allowed: false,
          message: 'Too many submissions from this IP. Please try again later.'
        }
      }

      // Check submissions from this email
      const emailQuery = query(
        collection(db, 'contactSubmissions'),
        where('form.email', '==', email),
        where('timestamp', '>', Timestamp.fromMillis(timeWindowStart)),
        orderBy('timestamp', 'desc')
      )

      const emailSubmissions = await getDocs(emailQuery)
      
      if (emailSubmissions.size >= RATE_LIMIT.maxSubmissions) {
        return {
          allowed: false,
          message: 'Too many submissions from this email. Please try again later.'
        }
      }

      return { allowed: true, message: '' }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      // Allow submission if rate limit check fails
      return { allowed: true, message: '' }
    }
  }

  // Save contact submission to Firestore
  private async saveToFirestore(
    formData: ContactForm, 
    clientIP?: string, 
    userAgent?: string
  ): Promise<ContactSubmission> {
    try {
      const submission: Omit<ContactSubmission, 'id'> = {
        form: formData,
        timestamp: serverTimestamp() as Timestamp,
        responded: false,
        clientIP,
        userAgent,
        spam: false,
        source: 'website'
      }

      const docRef = await addDoc(collection(db, 'contactSubmissions'), submission)
      
      return {
        id: docRef.id,
        ...submission,
        timestamp: Timestamp.now() // Use current timestamp for immediate return
      }
    } catch (error) {
      console.error('Failed to save to Firestore:', error)
      throw new Error('Failed to save contact submission')
    }
  }

  // Send email notification using EmailJS or similar service
  private async sendEmailNotification(formData: ContactForm, submissionId: string): Promise<boolean> {
    try {
      if (!this.emailConfig?.apiKey || !this.emailConfig?.templateId) {
        console.warn('Email service not configured')
        return false
      }

      // Using EmailJS as example - replace with your preferred service
      const emailData = {
        to_name: 'Portfolio Owner',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        submission_id: submissionId,
        timestamp: new Date().toISOString(),
        // Add auto-reply
        reply_to: formData.email,
        auto_reply_subject: 'Thank you for your message',
        auto_reply_message: `Hi ${formData.name},

Thank you for reaching out! I have received your message about "${formData.subject}" and will get back to you as soon as possible.

Here's a copy of your message for your records:
"${formData.message}"

Best regards,
[Your Name]

---
This is an automated response. Please do not reply to this email.`
      }

      // Replace with actual EmailJS call or your preferred email service
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_id: this.emailConfig.serviceId,
          template_id: this.emailConfig.templateId,
          user_id: this.emailConfig.userId,
          template_params: emailData
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to send email notification:', error)
      return false
    }
  }

  // Main submission handler
  async submitContactForm(
    formData: ContactForm, 
    options: { 
      clientIP?: string
      userAgent?: string
      sendEmail?: boolean
    } = {}
  ): Promise<{ success: boolean; message: string; submissionId?: string }> {
    try {
      // Validate form data
      const validation = await this.validateFormData(formData, options.clientIP)
      
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors[0] || 'Validation failed'
        }
      }

      // Save to Firestore
      const submission = await this.saveToFirestore(
        formData, 
        options.clientIP, 
        options.userAgent
      )

      // Send email notification if enabled
      let emailSent = false
      if (options.sendEmail !== false) {
        emailSent = await this.sendEmailNotification(formData, submission.id)
      }

      // Log successful submission
      console.log('Contact form submitted successfully:', {
        id: submission.id,
        email: formData.email,
        subject: formData.subject,
        emailSent
      })

      return {
        success: true,
        message: emailSent 
          ? 'Thank you for your message! I\'ll get back to you soon.' 
          : 'Thank you for your message! It has been saved and I\'ll respond as soon as possible.',
        submissionId: submission.id
      }
    } catch (error) {
      console.error('Contact form submission failed:', error)
      
      return {
        success: false,
        message: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred. Please try again later.'
      }
    }
  }

  // Get recent contact submissions (admin function)
  async getRecentSubmissions(limit_count = 10): Promise<ContactSubmission[]> {
    try {
      const q = query(
        collection(db, 'contactSubmissions'),
        orderBy('timestamp', 'desc'),
        limit(limit_count)
      )

      const querySnapshot = await getDocs(q)
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContactSubmission))
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
      throw new Error('Failed to fetch contact submissions')
    }
  }

  // Mark submission as responded (admin function)
  async markAsResponded(submissionId: string): Promise<boolean> {
    try {
      // This would typically be done through Firebase Admin SDK in a secure environment
      // For now, just return true to indicate the function exists
      console.log(`Marking submission ${submissionId} as responded`)
      return true
    } catch (error) {
      console.error('Failed to mark as responded:', error)
      return false
    }
  }

  // Get submission statistics
  async getSubmissionStats(): Promise<{
    total: number
    thisMonth: number
    responded: number
    responseRate: number
  }> {
    try {
      // Get total submissions
      const totalQuery = query(collection(db, 'contactSubmissions'))
      const totalSnapshot = await getDocs(totalQuery)
      const total = totalSnapshot.size

      // Get this month's submissions
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const monthQuery = query(
        collection(db, 'contactSubmissions'),
        where('timestamp', '>=', Timestamp.fromDate(monthStart))
      )
      const monthSnapshot = await getDocs(monthQuery)
      const thisMonth = monthSnapshot.size

      // Get responded submissions
      const respondedQuery = query(
        collection(db, 'contactSubmissions'),
        where('responded', '==', true)
      )
      const respondedSnapshot = await getDocs(respondedQuery)
      const responded = respondedSnapshot.size

      const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0

      return {
        total,
        thisMonth,
        responded,
        responseRate
      }
    } catch (error) {
      console.error('Failed to get submission stats:', error)
      return {
        total: 0,
        thisMonth: 0,
        responded: 0,
        responseRate: 0
      }
    }
  }
}

// Export singleton instance
export const contactService = ContactService.getInstance()

// Utility function to get client IP (to be used in API routes)
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const remoteAddr = request.headers.get('x-vercel-forwarded-for')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  if (remoteAddr) {
    return remoteAddr.split(',')[0].trim()
  }
  
  return 'unknown'
}

// Utility function to detect user agent
export function getUserAgent(request: Request): string {
  return request.headers.get('user-agent') || 'unknown'
}