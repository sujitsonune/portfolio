'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Mail, 
  User, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Shield,
  Clock,
  Star
} from 'lucide-react'
import type { ContactForm, ContactSubmission } from '@/types'
import { cn } from '@/lib/utils'

interface ContactFormProps {
  onSubmit: (formData: ContactForm) => Promise<{ success: boolean; message: string }>
  className?: string
  variant?: 'default' | 'compact' | 'inline'
  showResponseTime?: boolean
  expectedResponseTime?: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
  honeypot?: string
  general?: string
}

interface FormState {
  isSubmitting: boolean
  isSubmitted: boolean
  errors: FormErrors
  submitStatus: 'idle' | 'success' | 'error'
  submitMessage: string
}

const initialFormData: ContactForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  honeypot: ''
}

const initialFormState: FormState = {
  isSubmitting: false,
  isSubmitted: false,
  errors: {},
  submitStatus: 'idle',
  submitMessage: ''
}

// Subject suggestions for better user experience
const subjectSuggestions = [
  'General Inquiry',
  'Project Collaboration',
  'Job Opportunity',
  'Technical Discussion',
  'Partnership Proposal',
  'Speaking Engagement',
  'Consultation Request'
]

export function ContactForm({ 
  onSubmit, 
  className,
  variant = 'default',
  showResponseTime = true,
  expectedResponseTime = "24 hours"
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactForm>(initialFormData)
  const [formState, setFormState] = useState<FormState>(initialFormState)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const startTimeRef = useRef<number>(0)

  // Validation rules
  const validateForm = (): FormErrors => {
    const errors: FormErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be less than 100 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    } else if (formData.email.length > 254) {
      errors.email = 'Email address is too long'
    }

    // Subject validation
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required'
    } else if (formData.subject.trim().length < 5) {
      errors.subject = 'Subject must be at least 5 characters'
    } else if (formData.subject.trim().length > 200) {
      errors.subject = 'Subject must be less than 200 characters'
    }

    // Message validation
    if (!formData.message.trim()) {
      errors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters'
    } else if (formData.message.trim().length > 5000) {
      errors.message = 'Message must be less than 5000 characters'
    }

    // Honeypot spam protection
    if (formData.honeypot && formData.honeypot.trim() !== '') {
      errors.honeypot = 'Spam detected'
    }

    // Basic spam detection patterns
    const spamPatterns = [
      /\b(?:click here|buy now|free money|get rich|make money fast)\b/i,
      /\b(?:viagra|cialis|pharmacy|casino|poker)\b/i,
      /(http[s]?:\/\/[^\s]+){3,}/g // Multiple URLs
    ]

    const fullText = `${formData.name} ${formData.email} ${formData.subject} ${formData.message}`.toLowerCase()
    
    for (const pattern of spamPatterns) {
      if (pattern.test(fullText)) {
        errors.general = 'Message contains suspicious content'
        break
      }
    }

    // Time-based spam detection (too fast submission)
    const submissionTime = Date.now() - startTimeRef.current
    if (submissionTime < 3000) { // Less than 3 seconds
      errors.general = 'Please take more time to fill out the form'
    }

    return errors
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear specific field error when user starts typing
    if (formState.errors[name as keyof FormErrors]) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, [name]: undefined }
      }))
    }

    // Record start time on first interaction
    if (startTimeRef.current === 0) {
      startTimeRef.current = Date.now()
    }
  }

  const handleSubjectSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, subject: suggestion }))
    setShowSuggestions(false)
    
    // Clear subject error
    if (formState.errors.subject) {
      setFormState(prev => ({
        ...prev,
        errors: { ...prev.errors, subject: undefined }
      }))
    }
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setFormState(initialFormState)
    startTimeRef.current = 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const errors = validateForm()
    
    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({
        ...prev,
        errors,
        submitStatus: 'error',
        submitMessage: 'Please fix the errors above'
      }))
      return
    }

    // Start submission
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
      submitStatus: 'idle',
      submitMessage: ''
    }))

    try {
      const result = await onSubmit(formData)
      
      if (result.success) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isSubmitted: true,
          submitStatus: 'success',
          submitMessage: result.message || 'Message sent successfully!'
        }))
        
        // Reset form after success
        setTimeout(() => {
          resetForm()
        }, 5000)
      } else {
        throw new Error(result.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        submitStatus: 'error',
        submitMessage: error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      }))
    }
  }

  if (variant === 'compact') {
    return (
      <div className={cn('max-w-md', className)}>
        <AnimatePresence mode="wait">
          {formState.isSubmitted && formState.submitStatus === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Message Sent!
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {formState.submitMessage}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Honeypot field */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                className="absolute left-[-9999px] opacity-0"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className={cn(
                    'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                    formState.errors.name 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                {formState.errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formState.errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={cn(
                    'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                    formState.errors.email 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                {formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formState.errors.email}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Your message..."
                  rows={4}
                  className={cn(
                    'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none',
                    formState.errors.message 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                {formState.errors.message && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formState.errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={formState.isSubmitting}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors',
                  formState.isSubmitting && 'cursor-not-allowed'
                )}
                whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </motion.button>

              {/* Error Message */}
              {formState.submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{formState.submitMessage}</p>
                </motion.div>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn('max-w-2xl', className)}>
      <AnimatePresence mode="wait">
        {formState.isSubmitted && formState.submitStatus === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-6" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">
              Message Sent Successfully! 🎉
            </h3>
            
            <p className="text-green-700 dark:text-green-300 mb-6">
              {formState.submitMessage}
            </p>
            
            {showResponseTime && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Clock className="h-4 w-4" />
                <span>Expected response time: {expectedResponseTime}</span>
              </div>
            )}
            
            <motion.button
              onClick={resetForm}
              className="mt-6 px-6 py-2 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send Another Message
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-8 shadow-lg"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                Get In Touch
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                Send me a message and I'll get back to you soon
              </p>
              
              {showResponseTime && (
                <div className="flex items-center justify-center gap-2 mt-3 text-sm text-primary-600 dark:text-primary-400">
                  <Clock className="h-4 w-4" />
                  <span>Typical response time: {expectedResponseTime}</span>
                </div>
              )}
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field */}
              <input
                type="text"
                name="honeypot"
                value={formData.honeypot}
                onChange={handleInputChange}
                className="absolute left-[-9999px] opacity-0"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={cn(
                      'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                      formState.errors.name 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-secondary-200 dark:border-secondary-700'
                    )}
                    disabled={formState.isSubmitting}
                  />
                  {formState.errors.name && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formState.errors.name}
                    </motion.p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className={cn(
                      'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                      formState.errors.email 
                        ? 'border-red-300 dark:border-red-700' 
                        : 'border-secondary-200 dark:border-secondary-700'
                    )}
                    disabled={formState.isSubmitting}
                  />
                  {formState.errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formState.errors.email}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Subject Field */}
              <div className="relative">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <Star className="inline h-4 w-4 mr-1" />
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="What's this about?"
                  className={cn(
                    'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                    formState.errors.subject 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                
                {/* Subject Suggestions */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 w-full mt-1 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                    >
                      {subjectSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSubjectSuggestionClick(suggestion)}
                          className="w-full px-4 py-2 text-left text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 first:rounded-t-lg last:rounded-b-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {formState.errors.subject && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formState.errors.subject}
                  </motion.p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  <MessageSquare className="inline h-4 w-4 mr-1" />
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell me about your project, question, or how I can help you..."
                  rows={6}
                  className={cn(
                    'w-full px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none',
                    formState.errors.message 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                <div className="flex justify-between items-center mt-2">
                  {formState.errors.message ? (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formState.errors.message}
                    </motion.p>
                  ) : (
                    <div />
                  )}
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    {formData.message.length}/5000
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={formState.isSubmitting}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl',
                  formState.isSubmitting && 'cursor-not-allowed'
                )}
                whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Send Message
                    <Shield className="h-4 w-4 opacity-70" />
                  </>
                )}
              </motion.button>

              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <Shield className="h-3 w-3" />
                <span>Protected by spam detection and encryption</span>
              </div>

              {/* Error Message */}
              {formState.submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Failed to send message
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {formState.submitMessage}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* General Error */}
              {formState.errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">{formState.errors.general}</p>
                </motion.div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}