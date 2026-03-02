import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXTJS_LOG_SENTRY_DSN,
  environment: process.env.NEXTJS_LOG_SENTRY_ENVIRONMENT || 'development',
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  // Disable debug logging to reduce console noise
  debug: false,
})
