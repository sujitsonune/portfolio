import type { FirebaseError } from '@/types'

// Error codes mapping
export const FIREBASE_ERROR_CODES = {
  // Authentication errors
  'auth/user-not-found': 'User not found',
  'auth/wrong-password': 'Invalid password',
  'auth/email-already-in-use': 'Email is already registered',
  'auth/weak-password': 'Password should be at least 6 characters',
  'auth/invalid-email': 'Invalid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later',
  
  // Firestore errors
  'firestore/permission-denied': 'You do not have permission to perform this action',
  'firestore/unavailable': 'Service is currently unavailable. Please try again later',
  'firestore/deadline-exceeded': 'Request timed out. Please try again',
  'firestore/resource-exhausted': 'Quota exceeded. Please try again later',
  'firestore/not-found': 'Requested resource not found',
  'firestore/already-exists': 'Resource already exists',
  'firestore/failed-precondition': 'Operation failed due to invalid state',
  'firestore/cancelled': 'Operation was cancelled',
  'firestore/data-loss': 'Data loss detected',
  'firestore/unauthenticated': 'Authentication required',
  
  // Storage errors
  'storage/unauthorized': 'You are not authorized to perform this action',
  'storage/cancelled': 'Upload was cancelled',
  'storage/unknown': 'An unknown error occurred during upload',
  'storage/object-not-found': 'File not found',
  'storage/bucket-not-found': 'Storage bucket not found',
  'storage/project-not-found': 'Project not found',
  'storage/quota-exceeded': 'Storage quota exceeded',
  'storage/unauthenticated': 'Authentication required for storage access',
  'storage/unauthorized': 'Not authorized to access this resource',
  'storage/retry-limit-exceeded': 'Upload retry limit exceeded',
  'storage/invalid-checksum': 'File upload failed due to checksum mismatch',
  'storage/canceled': 'Operation was canceled',
  
  // Network errors
  'network/request-failed': 'Network request failed. Please check your connection',
  'network/timeout': 'Request timed out. Please try again',
  
  // Validation errors
  'validation/required-field': 'This field is required',
  'validation/invalid-format': 'Invalid format',
  'validation/min-length': 'Value is too short',
  'validation/max-length': 'Value is too long',
  'validation/invalid-email': 'Please enter a valid email address',
  'validation/invalid-url': 'Please enter a valid URL',
  
  // Generic errors
  'unknown': 'An unexpected error occurred',
  'offline': 'You are currently offline. Please check your connection',
  'maintenance': 'Service is under maintenance. Please try again later',
} as const

export type FirebaseErrorCode = keyof typeof FIREBASE_ERROR_CODES

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Enhanced error interface
export interface EnhancedFirebaseError extends FirebaseError {
  severity: ErrorSeverity
  userMessage: string
  timestamp: Date
  retry?: boolean
  action?: string
}

// Error handling utilities
export class ErrorHandler {
  static processFirebaseError(error: any): EnhancedFirebaseError {
    const code = error.code || 'unknown'
    const originalMessage = error.message || 'An unexpected error occurred'
    
    // Get user-friendly message
    const userMessage = this.getUserFriendlyMessage(code)
    
    // Determine severity
    const severity = this.getErrorSeverity(code)
    
    // Determine if retry is possible
    const retry = this.canRetry(code)
    
    // Determine suggested action
    const action = this.getSuggestedAction(code)
    
    return {
      code,
      message: originalMessage,
      userMessage,
      severity,
      timestamp: new Date(),
      retry,
      action,
      details: error,
    }
  }

  static getUserFriendlyMessage(code: string): string {
    return FIREBASE_ERROR_CODES[code as FirebaseErrorCode] || FIREBASE_ERROR_CODES.unknown
  }

  static getErrorSeverity(code: string): ErrorSeverity {
    // Critical errors that require immediate attention
    if (['firestore/data-loss', 'storage/quota-exceeded', 'auth/user-disabled'].includes(code)) {
      return ErrorSeverity.CRITICAL
    }
    
    // High severity errors that significantly impact functionality
    if ([
      'firestore/permission-denied',
      'firestore/unauthenticated',
      'auth/user-not-found',
      'storage/unauthorized',
    ].includes(code)) {
      return ErrorSeverity.HIGH
    }
    
    // Medium severity errors that may impact user experience
    if ([
      'firestore/unavailable',
      'firestore/deadline-exceeded',
      'network/request-failed',
      'network/timeout',
    ].includes(code)) {
      return ErrorSeverity.MEDIUM
    }
    
    // Low severity errors that are recoverable
    return ErrorSeverity.LOW
  }

  static canRetry(code: string): boolean {
    const retryableErrors = [
      'firestore/unavailable',
      'firestore/deadline-exceeded',
      'firestore/resource-exhausted',
      'network/request-failed',
      'network/timeout',
      'storage/retry-limit-exceeded',
      'unknown',
    ]
    
    return retryableErrors.includes(code)
  }

  static getSuggestedAction(code: string): string {
    const actionMap: Record<string, string> = {
      'auth/user-not-found': 'Please check your email address or sign up for a new account',
      'auth/wrong-password': 'Please check your password or use forgot password',
      'auth/email-already-in-use': 'Please use a different email address or sign in',
      'auth/weak-password': 'Please choose a stronger password',
      'auth/invalid-email': 'Please enter a valid email address',
      'auth/too-many-requests': 'Please wait a few minutes before trying again',
      'firestore/permission-denied': 'Please contact support if you believe this is an error',
      'firestore/unavailable': 'Please try again in a few moments',
      'firestore/deadline-exceeded': 'Please try again with a better connection',
      'firestore/unauthenticated': 'Please sign in to continue',
      'network/request-failed': 'Please check your internet connection and try again',
      'network/timeout': 'Please check your connection and try again',
      'storage/quota-exceeded': 'Please contact support to increase your storage limit',
      'validation/required-field': 'Please fill in all required fields',
      'validation/invalid-format': 'Please check the format of your input',
      'offline': 'Please check your internet connection',
    }
    
    return actionMap[code] || 'Please try again or contact support if the problem persists'
  }

  static logError(error: EnhancedFirebaseError, context?: string): void {
    const logData = {
      ...error,
      context,
      url: typeof window !== 'undefined' ? window.location.href : null,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : null,
    }
    
    // Log based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('🚨 CRITICAL ERROR:', logData)
        // In production, you might want to send this to an error reporting service
        break
      case ErrorSeverity.HIGH:
        console.error('❌ HIGH SEVERITY ERROR:', logData)
        break
      case ErrorSeverity.MEDIUM:
        console.warn('⚠️ MEDIUM SEVERITY ERROR:', logData)
        break
      case ErrorSeverity.LOW:
        console.log('ℹ️ LOW SEVERITY ERROR:', logData)
        break
    }
  }

  static shouldShowErrorToUser(error: EnhancedFirebaseError): boolean {
    // Don't show low severity errors to users unless they're validation errors
    if (error.severity === ErrorSeverity.LOW && !error.code.startsWith('validation/')) {
      return false
    }
    
    return true
  }
}

// Retry utility
export class RetryHandler {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000,
    backoff: number = 2
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const processedError = ErrorHandler.processFirebaseError(error)
        
        // Don't retry if the error is not retryable
        if (!ErrorHandler.canRetry(processedError.code)) {
          throw processedError
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break
        }
        
        // Wait before retrying
        const currentDelay = delay * Math.pow(backoff, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, currentDelay))
        
        console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) after ${currentDelay}ms`)
      }
    }
    
    throw ErrorHandler.processFirebaseError(lastError)
  }
}

// Error boundary hook helper
export function useErrorHandler() {
  const handleError = (error: any, context?: string) => {
    const processedError = ErrorHandler.processFirebaseError(error)
    ErrorHandler.logError(processedError, context)
    
    return processedError
  }

  const handleAsyncError = async <T>(
    operation: () => Promise<T>,
    context?: string,
    maxRetries: number = 3
  ): Promise<{ data: T | null; error: EnhancedFirebaseError | null }> => {
    try {
      const data = await RetryHandler.withRetry(operation, maxRetries)
      return { data, error: null }
    } catch (error) {
      const processedError = handleError(error, context)
      return { data: null, error: processedError }
    }
  }

  return {
    handleError,
    handleAsyncError,
  }
}

// Validation utilities
export class ValidationError extends Error {
  constructor(public field: string, public code: string, message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateRequired(value: any, fieldName: string): void {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new ValidationError(fieldName, 'validation/required-field', `${fieldName} is required`)
  }
}

export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('email', 'validation/invalid-email', 'Please enter a valid email address')
  }
}

export function validateUrl(url: string): void {
  try {
    new URL(url)
  } catch {
    throw new ValidationError('url', 'validation/invalid-url', 'Please enter a valid URL')
  }
}

export function validateLength(value: string, min: number, max: number, fieldName: string): void {
  if (value.length < min) {
    throw new ValidationError(fieldName, 'validation/min-length', `${fieldName} must be at least ${min} characters`)
  }
  if (value.length > max) {
    throw new ValidationError(fieldName, 'validation/max-length', `${fieldName} must be no more than ${max} characters`)
  }
}