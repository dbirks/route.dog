import * as Sentry from "@sentry/react"

export function initSentry() {
  // Only initialize in production or if explicitly enabled
  const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
  const SENTRY_ENVIRONMENT = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE

  if (!SENTRY_DSN) {
    console.log("Sentry DSN not configured, skipping initialization")
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,

    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: SENTRY_ENVIRONMENT === "production" ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

    // Filter out development errors
    beforeSend(event) {
      // Don't send events in development mode unless explicitly enabled
      if (SENTRY_ENVIRONMENT === "development" && !import.meta.env.VITE_SENTRY_DEBUG) {
        return null
      }
      return event
    },

    // Additional config
    enabled: import.meta.env.PROD || import.meta.env.VITE_SENTRY_DEBUG === "true",
  })
}

// Helper to manually capture errors
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Helper to set user context
export function setUserContext(user: { id?: string; email?: string; username?: string }) {
  Sentry.setUser(user)
}

// Helper to add breadcrumb
export function addBreadcrumb(message: string, category?: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  })
}
