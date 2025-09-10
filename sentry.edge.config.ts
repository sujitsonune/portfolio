import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Edge runtime specific configuration
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Minimal integrations for edge runtime
  integrations: [],

  // Edge-specific error filtering
  beforeSend(event, hint) {
    // Add edge context
    event.contexts = {
      ...event.contexts,
      edge: {
        runtime: 'edge',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV
      }
    }

    return event
  },

  // Initial scope for edge
  initialScope: {
    tags: {
      component: 'edge',
      runtime: 'edge',
      environment: process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV
    }
  },

  debug: false // Keep disabled for edge runtime
})