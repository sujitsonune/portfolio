'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RotateCcw, Home, Bug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useErrorTracking } from '@/lib/errorTracking'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
  hasError: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  eventId?: string
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId?: NodeJS.Timeout
  private prevResetKeys?: Array<string | number>

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
    this.prevResetKeys = props.resetKeys
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught An Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }

    // Track error with Sentry and other services
    try {
      const errorTracker = require('@/lib/errorTracking').ErrorTracker.getInstance()
      errorTracker.captureError(error, {
        type: 'react-error-boundary',
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        props: this.props.resetKeys ? { resetKeys: this.props.resetKeys } : undefined
      })
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props
    const { hasError } = this.state
    
    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (this.hasResetKeysChanged(prevProps.resetKeys, resetKeys)) {
        this.resetErrorBoundary()
      }
    }
  }

  hasResetKeysChanged = (
    prevResetKeys?: Array<string | number>,
    nextResetKeys?: Array<string | number>
  ): boolean => {
    if (!prevResetKeys && !nextResetKeys) return false
    if (!prevResetKeys || !nextResetKeys) return true
    if (prevResetKeys.length !== nextResetKeys.length) return true
    
    return prevResetKeys.some((key, index) => key !== nextResetKeys[index])
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }

    this.resetTimeoutId = setTimeout(() => {
      this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }, 100)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback

      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            resetError={this.resetErrorBoundary}
            hasError={this.state.hasError}
          />
        )
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetErrorBoundary} />
    }

    return this.props.children
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const isProduction = process.env.NODE_ENV === 'production'

  const handleReportError = () => {
    const subject = encodeURIComponent(`Error Report: ${error.name}`)
    const body = encodeURIComponent(
      `I encountered an error on the portfolio website:\n\n` +
      `Error: ${error.message}\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}\n` +
      `Timestamp: ${new Date().toISOString()}\n\n` +
      `Please let me know if you need any additional information.`
    )
    
    window.open(`mailto:your-email@example.com?subject=${subject}&body=${body}`, '_blank')
  }

  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="p-4 bg-destructive/10 rounded-full">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Oops! Something went wrong
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, it's not your fault. 
            Please try refreshing the page or go back to the homepage.
          </p>

          {!isProduction && (
            <details className="mt-6 p-4 bg-muted rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
                🐛 Technical Details (Development Mode)
              </summary>
              <div className="mt-4 space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Error:</span> {error.name}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Message:</span> {error.message}
                </div>
                {error.stack && (
                  <div className="text-sm">
                    <span className="font-medium">Stack:</span>
                    <pre className="mt-2 text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetError} variant="default" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>
          
          <Button onClick={handleGoHome} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>

          <Button onClick={handleReportError} variant="outline" className="gap-2">
            <Bug className="h-4 w-4" />
            Report Issue
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            If this problem persists, please{' '}
            <button 
              onClick={handleReportError}
              className="text-primary hover:underline font-medium"
            >
              contact support
            </button>
            {' '}and include the error details above.
          </p>
        </div>
      </div>
    </div>
  )
}

// Hook for using error boundary in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  // Throw error in render phase to be caught by error boundary
  if (error) {
    throw error
  }

  return { captureError, resetError }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Async error boundary for handling promise rejections
export function AsyncErrorBoundary({ children, onError }: {
  children: ReactNode
  onError?: (error: Error) => void
}) {
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
      onError?.(error)
      
      // Prevent the default browser behavior
      event.preventDefault()
      
      // Throw error to be caught by error boundary
      throw error
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError])

  return <>{children}</>
}