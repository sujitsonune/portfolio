'use client'

import * as Sentry from '@sentry/nextjs'
import { getPerformanceTracker } from './monitoring'

// Error boundary utilities
export class ErrorTracker {
  private static instance: ErrorTracker | null = null
  private isInitialized = false

  private constructor() {
    this.initializeErrorTracking()
  }

  public static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  private initializeErrorTracking() {
    if (this.isInitialized || typeof window === 'undefined') return

    // Global error handler
    window.addEventListener('error', this.handleGlobalError.bind(this))
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    
    // Resource loading errors
    window.addEventListener('error', this.handleResourceError.bind(this), true)

    this.isInitialized = true
  }

  private handleGlobalError(event: ErrorEvent) {
    this.captureError(event.error || new Error(event.message), {
      type: 'global-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    
    this.captureError(error, {
      type: 'unhandled-promise-rejection',
      reason: event.reason
    })
  }

  private handleResourceError(event: Event) {
    const target = event.target as HTMLElement
    
    if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
      this.captureError(new Error(`Resource loading failed: ${(target as any).src || (target as any).href}`), {
        type: 'resource-error',
        tagName: target.tagName,
        src: (target as any).src || (target as any).href
      })
    }
  }

  // Public methods
  public captureError(error: Error, context?: Record<string, any>) {
    try {
      // Add additional context
      const errorContext = {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        deviceInfo: this.getDeviceInfo()
      }

      // Send to Sentry
      Sentry.withScope((scope) => {
        scope.setContext('error_details', errorContext)
        scope.setLevel('error')
        Sentry.captureException(error)
      })

      // Log to performance tracker
      const performanceTracker = getPerformanceTracker()
      if (performanceTracker) {
        performanceTracker.trackError(error, context?.type)
      }

      // Development logging
      if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Error tracked:', error, errorContext)
      }

    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
    }
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    try {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setContext('message_details', context)
        }
        scope.setLevel(level)
        Sentry.captureMessage(message)
      })
    } catch (error) {
      console.error('Failed to capture message:', error)
    }
  }

  public setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user)
  }

  public setTag(key: string, value: string) {
    Sentry.setTag(key, value)
  }

  public setContext(key: string, context: Record<string, any>) {
    Sentry.setContext(key, context)
  }

  public addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000
    })
  }

  private getDeviceInfo() {
    return {
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${screen.width}x${screen.height}`,
      pixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled
    }
  }
}

// React Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{
    fallback?: React.ComponentType<{ error: Error; reset: () => void }>
    onError?: (error: Error, errorInfo: any) => void
  }>,
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo })

    // Track error
    const errorTracker = ErrorTracker.getInstance()
    errorTracker.captureError(error, {
      type: 'react-error-boundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback
      
      if (FallbackComponent) {
        return <FallbackComponent error={this.state.error} reset={this.reset} />
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.084 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Something went wrong
                </h3>
              </div>
            </div>
            
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <p>An unexpected error occurred. Please try refreshing the page.</p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            
            <div className="mt-4 flex space-x-3">
              <button
                onClick={this.reset}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for using error tracking in functional components
export function useErrorTracking() {
  const errorTracker = ErrorTracker.getInstance()

  return {
    captureError: errorTracker.captureError.bind(errorTracker),
    captureMessage: errorTracker.captureMessage.bind(errorTracker),
    setUser: errorTracker.setUser.bind(errorTracker),
    setTag: errorTracker.setTag.bind(errorTracker),
    setContext: errorTracker.setContext.bind(errorTracker),
    addBreadcrumb: errorTracker.addBreadcrumb.bind(errorTracker)
  }
}

// Async error handler for server actions
export function withErrorTracking<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const errorTracker = ErrorTracker.getInstance()
      errorTracker.captureError(
        error instanceof Error ? error : new Error(String(error)),
        { type: 'async-function', context }
      )
      throw error
    }
  }
}

// Initialize error tracking
let isInitialized = false

export function initializeErrorTracking() {
  if (isInitialized || typeof window === 'undefined') return

  // Initialize the error tracker
  ErrorTracker.getInstance()
  
  // Set up breadcrumb tracking for navigation
  if (typeof window !== 'undefined') {
    // Track navigation
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      ErrorTracker.getInstance().addBreadcrumb(
        `Navigation to ${args[2]}`,
        'navigation',
        'info'
      )
      return originalPushState.apply(this, args)
    }

    window.history.replaceState = function(...args) {
      ErrorTracker.getInstance().addBreadcrumb(
        `Navigation replaced to ${args[2]}`,
        'navigation',
        'info'
      )
      return originalReplaceState.apply(this, args)
    }

    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button, a')) {
        const element = target.tagName === 'BUTTON' || target.tagName === 'A' ? target : target.closest('button, a')
        const text = element?.textContent?.trim() || ''
        const href = (element as HTMLAnchorElement)?.href || ''
        
        ErrorTracker.getInstance().addBreadcrumb(
          `Clicked: ${text}`,
          'ui.click',
          'info',
          { href, tag: element?.tagName }
        )
      }
    })
  }

  isInitialized = true
}

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  initializeErrorTracking()
}