'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  Bell,
  Sparkles,
  ArrowRight,
  X,
  Users,
  Calendar,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'inline' | 'modal' | 'banner'
  title?: string
  description?: string
  placeholder?: string
  buttonText?: string
  showBenefits?: boolean
  showStats?: boolean
  className?: string
  onSubscribe?: (email: string) => Promise<{ success: boolean; message: string }>
  onClose?: () => void
}

interface NewsletterFormState {
  email: string
  isSubmitting: boolean
  isSubmitted: boolean
  status: 'idle' | 'success' | 'error'
  message: string
  errors: Record<string, string>
}

const initialFormState: NewsletterFormState = {
  email: '',
  isSubmitting: false,
  isSubmitted: false,
  status: 'idle',
  message: '',
  errors: {}
}

// Mock stats - replace with real data
const newsletterStats = {
  subscribers: 1234,
  openRate: '47%',
  frequency: 'Weekly'
}

const benefits = [
  {
    icon: Zap,
    title: 'Latest Updates',
    description: 'Get notified about new projects and blog posts'
  },
  {
    icon: Calendar,
    title: 'Weekly Insights',
    description: 'Industry trends and development tips'
  },
  {
    icon: Users,
    title: 'Exclusive Content',
    description: 'Subscriber-only resources and early access'
  }
]

export function NewsletterSignup({
  variant = 'default',
  title = 'Stay in the Loop',
  description = 'Get the latest updates on projects, articles, and industry insights delivered to your inbox.',
  placeholder = 'Enter your email address',
  buttonText = 'Subscribe',
  showBenefits = true,
  showStats = true,
  className,
  onSubscribe,
  onClose
}: NewsletterSignupProps) {
  const [formState, setFormState] = useState<NewsletterFormState>(initialFormState)

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email.trim()) {
      return 'Email is required'
    }
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    
    if (email.length > 254) {
      return 'Email address is too long'
    }

    // Check for disposable email domains
    const disposableDomains = [
      '10minutemail.com',
      'tempmail.org',
      'guerrillamail.com',
      'mailinator.com',
      'yopmail.com'
    ]
    
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && disposableDomains.includes(domain)) {
      return 'Please use a permanent email address'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    const emailError = validateEmail(formState.email)
    if (emailError) {
      setFormState(prev => ({
        ...prev,
        errors: { email: emailError },
        status: 'error',
        message: emailError
      }))
      return
    }

    // Start submission
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      errors: {},
      status: 'idle',
      message: ''
    }))

    try {
      let result
      
      if (onSubscribe) {
        result = await onSubscribe(formState.email)
      } else {
        // Default subscription logic (replace with actual implementation)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
        result = { success: true, message: 'Successfully subscribed!' }
      }

      if (result.success) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isSubmitted: true,
          status: 'success',
          message: result.message
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setFormState(prev => ({
        ...prev,
        isSubmitting: false,
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to subscribe. Please try again.'
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormState(prev => ({
      ...prev,
      email: value,
      errors: { ...prev.errors, email: '' },
      status: 'idle',
      message: ''
    }))
  }

  const resetForm = () => {
    setFormState(initialFormState)
  }

  if (variant === 'compact') {
    return (
      <div className={cn('max-w-md', className)}>
        <AnimatePresence mode="wait">
          {formState.isSubmitted && formState.status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
            >
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                You're In! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                {formState.message}
              </p>
              <button
                onClick={resetForm}
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium"
              >
                Subscribe another email
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-sm text-secondary-600 dark:text-secondary-400 mb-4">
                  {description}
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  className={cn(
                    'flex-1 px-4 py-3 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors',
                    formState.errors.email 
                      ? 'border-red-300 dark:border-red-700' 
                      : 'border-secondary-200 dark:border-secondary-700'
                  )}
                  disabled={formState.isSubmitting}
                />
                <motion.button
                  type="submit"
                  disabled={formState.isSubmitting}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                  whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
                >
                  {formState.isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </motion.button>
              </div>

              {/* Error Message */}
              {formState.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-300">{formState.message}</p>
                </motion.div>
              )}

              <div className="flex items-center justify-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <Shield className="h-3 w-3" />
                <span>No spam, unsubscribe anytime</span>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex gap-4 items-center max-w-lg', className)}>
        <input
          type="email"
          value={formState.email}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit(e as any)
            }
          }}
          placeholder={placeholder}
          className={cn(
            'flex-1 px-4 py-2 bg-white dark:bg-secondary-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm',
            formState.errors.email 
              ? 'border-red-300 dark:border-red-700' 
              : 'border-secondary-200 dark:border-secondary-700'
          )}
          disabled={formState.isSubmitting}
        />
        <motion.button
          onClick={(e) => handleSubmit(e as any)}
          disabled={formState.isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
          whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
        >
          {formState.isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </>
          ) : (
            <>
              {buttonText}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'relative bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 rounded-xl shadow-lg',
          className
        )}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-primary-100 text-sm">{description}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="email"
              value={formState.email}
              onChange={handleInputChange}
              placeholder={placeholder}
              className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/70 text-sm min-w-[250px]"
              disabled={formState.isSubmitting}
            />
            <motion.button
              onClick={(e) => handleSubmit(e as any)}
              disabled={formState.isSubmitting}
              className="px-6 py-2 bg-white text-primary-600 hover:bg-primary-50 disabled:opacity-50 font-medium rounded-lg transition-colors text-sm"
              whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
            >
              {formState.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                buttonText
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Default variant
  return (
    <div className={cn('max-w-2xl', className)}>
      <AnimatePresence mode="wait">
        {formState.isSubmitted && formState.status === 'success' ? (
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
              Welcome Aboard! 🎉
            </h3>
            
            <p className="text-green-700 dark:text-green-300 mb-6">
              {formState.message}
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-green-600 dark:text-green-400 mb-6">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Weekly updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Exclusive content</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>No spam</span>
              </div>
            </div>
            
            <motion.button
              onClick={resetForm}
              className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe another email
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-secondary-600 dark:text-secondary-400">
                {description}
              </p>
            </div>

            {/* Benefits */}
            {showBenefits && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                  >
                    <benefit.icon className="h-6 w-6 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                    <h4 className="font-semibold text-secondary-900 dark:text-white text-sm mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-secondary-600 dark:text-secondary-400">
                      {benefit.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Stats */}
            {showStats && (
              <div className="flex justify-center gap-8 mb-8 text-sm text-secondary-600 dark:text-secondary-400">
                <div className="text-center">
                  <div className="font-semibold text-secondary-900 dark:text-white">
                    {newsletterStats.subscribers.toLocaleString()}
                  </div>
                  <div>Subscribers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-secondary-900 dark:text-white">
                    {newsletterStats.openRate}
                  </div>
                  <div>Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-secondary-900 dark:text-white">
                    {newsletterStats.frequency}
                  </div>
                  <div>Updates</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  className={cn(
                    'w-full px-4 py-4 bg-white dark:bg-secondary-800 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-lg',
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

              <motion.button
                type="submit"
                disabled={formState.isSubmitting}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg',
                  formState.isSubmitting && 'cursor-not-allowed'
                )}
                whileHover={{ scale: formState.isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: formState.isSubmitting ? 1 : 0.98 }}
              >
                {formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    {buttonText}
                    <Sparkles className="h-4 w-4 opacity-70" />
                  </>
                )}
              </motion.button>

              {/* Privacy Notice */}
              <div className="flex items-center justify-center gap-2 text-xs text-secondary-500 dark:text-secondary-400">
                <Shield className="h-3 w-3" />
                <span>No spam, unsubscribe anytime. Read our privacy policy.</span>
              </div>

              {/* Error Message */}
              {formState.status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                >
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Subscription failed
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      {formState.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}