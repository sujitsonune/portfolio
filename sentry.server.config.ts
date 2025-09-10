import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Performance monitoring
  enabled: process.env.NODE_ENV === 'production',
  
  // Environment
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Server-specific integrations
  integrations: [
    new Sentry.ExtraErrorData({
      depth: 5
    }),
    new Sentry.RewriteFrames({
      root: process.cwd()
    })
  ],

  // Server-side error filtering
  beforeSend(event, hint) {
    // Add server context
    event.contexts = {
      ...event.contexts,
      server: {
        name: 'portfolio-server',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV
      }
    }

    // Filter out specific server errors
    const error = hint.originalException
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as Error).message
      
      // Filter out common non-critical server errors
      if (
        message.includes('ECONNRESET') ||
        message.includes('EPIPE') ||
        message.includes('socket hang up') ||
        message.includes('Request timeout')
      ) {
        return null
      }
    }

    return event
  },

  // Initial scope for server
  initialScope: {
    tags: {
      component: 'server',
      environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV
    }
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true'
})