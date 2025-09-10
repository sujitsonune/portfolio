'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

interface FormData {
  email: string
  password: string
}

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const { signIn, sendPasswordReset } = useAuthContext()
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation (only for login mode)
    if (!isResetMode && !formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      if (isResetMode) {
        const result = await sendPasswordReset(formData.email)
        if (result.success) {
          setResetEmailSent(true)
        } else {
          setErrors({ general: result.message })
        }
      } else {
        const result = await signIn(formData.email, formData.password)
        if (result.success) {
          onSuccess?.()
        } else {
          setErrors({ general: result.message })
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const toggleMode = () => {
    setIsResetMode(!isResetMode)
    setErrors({})
    setResetEmailSent(false)
    if (!isResetMode) {
      setFormData(prev => ({ ...prev, password: '' }))
    }
  }

  if (resetEmailSent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "w-full max-w-md bg-white dark:bg-secondary-900 rounded-lg shadow-xl p-8",
          className
        )}
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Check Your Email
          </h2>
          
          <p className="text-secondary-600 dark:text-secondary-300">
            We've sent a password reset link to <strong>{formData.email}</strong>
          </p>
          
          <button
            onClick={toggleMode}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "w-full max-w-md bg-white dark:bg-secondary-900 rounded-lg shadow-xl overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            {isResetMode ? 'Reset Password' : 'Admin Login'}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300">
            {isResetMode 
              ? 'Enter your email to receive a password reset link'
              : 'Sign in to access the admin dashboard'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
        {/* General Error */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md flex items-center gap-2"
            >
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{errors.general}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-secondary-900 dark:text-white">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={cn(
                "block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                errors.email
                  ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                  : "border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500"
              )}
              placeholder="admin@example.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field (only in login mode) */}
        <AnimatePresence>
          {!isResetMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <label htmlFor="password" className="block text-sm font-medium text-secondary-900 dark:text-white">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    "block w-full pl-10 pr-10 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                    errors.password
                      ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
                      : "border-secondary-300 dark:border-secondary-600 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white placeholder-secondary-500"
                  )}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400 hover:text-secondary-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
            isLoading
              ? "bg-secondary-400 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-700"
          )}
          whileHover={!isLoading ? { scale: 1.02 } : {}}
          whileTap={!isLoading ? { scale: 0.98 } : {}}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{isResetMode ? 'Send Reset Email' : 'Sign In'}</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>

        {/* Toggle Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            disabled={isLoading}
          >
            {isResetMode ? 'Back to Login' : 'Forgot Password?'}
          </button>
        </div>
      </form>

      {/* Footer */}
      <div className="px-8 py-4 bg-secondary-50 dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-700">
        <p className="text-xs text-secondary-500 dark:text-secondary-400 text-center">
          This is a secure admin area. Only authorized users can access this dashboard.
        </p>
      </div>
    </motion.div>
  )
}