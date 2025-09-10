'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react'
import { trackPortfolioEvents } from '@/lib/analytics'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Track error in analytics
    if (typeof window !== 'undefined') {
      trackPortfolioEvents.searchPortfolio(`error: ${error.message}`)
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In development, also log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReportError = () => {
    const { error, errorInfo } = this.state
    
    const errorReport = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    // Create mailto link with error details
    const subject = encodeURIComponent('Portfolio Error Report')
    const body = encodeURIComponent(`
Error Report:
${JSON.stringify(errorReport, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim())

    window.open(`mailto:your-email@example.com?subject=${subject}&body=${body}`)
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onRetry={this.handleRetry}
        onReportError={this.handleReportError}
      />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onRetry: () => void
  onReportError: () => void
}

function ErrorFallback({ error, errorInfo, onRetry, onReportError }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white dark:bg-secondary-900 rounded-lg shadow-xl p-8 text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </motion.div>

        {/* Error Message */}
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Oops! Something went wrong
          </h1>
          <p className="text-secondary-600 dark:text-secondary-300 text-lg">
            Don't worry, this happens sometimes. The error has been logged and I'll look into it.
          </p>
          
          {isDevelopment && error && (
            <div className="text-left mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Development Error Details:
              </h3>
              <div className="text-sm font-mono text-red-700 dark:text-red-300 whitespace-pre-wrap">
                {error.toString()}
              </div>
              {error.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-red-700 dark:text-red-300 font-medium">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </motion.button>

          <motion.button
            onClick={() => window.location.href = '/'}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary-200 dark:bg-secondary-800 text-secondary-900 dark:text-white hover:bg-secondary-300 dark:hover:bg-secondary-700 rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Home className="h-4 w-4" />
            Go Home
          </motion.button>

          <motion.button
            onClick={onReportError}
            className="flex items-center justify-center gap-2 px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Mail className="h-4 w-4" />
            Report Issue
          </motion.button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-secondary-200 dark:border-secondary-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            If this problem persists, please try refreshing the page or clearing your browser cache.
            You can also reach out to me directly through the contact form.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-secondary-400">
            <span>Error ID: {Date.now().toString(36)}</span>
            <span>•</span>
            <span>Version: 1.0.0</span>
            <span>•</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Specific error boundary for async components
export class AsyncErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AsyncErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Bug className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
            Failed to load content
          </h3>
          <p className="text-secondary-600 dark:text-secondary-300 mb-4">
            There was an error loading this section.
          </p>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary