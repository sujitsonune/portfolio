import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  
  // Capture Console
  integrations: [
    new Sentry.Replay({
      // Additional Replay configuration goes here, for example:
      maskAllText: false,
      blockAllMedia: false,
    }),
    new Sentry.CaptureConsole({
      levels: ['error', 'warn']
    }),
    new Sentry.HttpContext({
      breadcrumbs: true,
      tracing: true
    }),
    new Sentry.ExtraErrorData({
      depth: 5
    })
  ],

  // Performance monitoring
  enabled: process.env.NODE_ENV === 'production',
  
  // Environment
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // User context
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      return null
    }

    // Filter out specific errors
    const error = hint.originalException
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as Error).message
      
      // Filter out common non-critical errors
      if (
        message.includes('ResizeObserver loop limit exceeded') ||
        message.includes('Non-Error promise rejection captured') ||
        message.includes('ChunkLoadError') ||
        message.includes('Script error')
      ) {
        return null
      }
    }

    return event
  },

  // Set user context
  initialScope: {
    tags: {
      component: 'client',
      environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV
    }
  },

  // Configure transport
  transportOptions: {
    // Helps respective integrations to decide whether to capture the event or not
    // based on the URL. This is useful for filtering out events from certain domains.
    allowUrls: [
      // Allow errors from your domain
      /https:\/\/.*\.vercel\.app/,
      /https:\/\/.*\.com/,
      /localhost/
    ]
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development' && process.env.SENTRY_DEBUG === 'true',
  
  // Ignore specific errors
  ignoreErrors: [
    // Ignore browser extension errors
    'Non-Error promise rejection captured',
    'ResizeObserver loop limit exceeded',
    'Script error.',
    'Network request failed',
    
    // Ignore common React errors that are non-critical
    'Hydration failed because the initial UI does not match',
    'Text content did not match',
    
    // Ignore specific third-party errors
    /extension\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i
  ]
})