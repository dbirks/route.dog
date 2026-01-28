import React from 'react'
import * as Sentry from '@sentry/react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundaryClass extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })

    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <AlertTriangle className="w-12 h-12 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Something went wrong</h1>
              <p className="text-muted-foreground">
                We've been notified about this error and will look into it.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="p-4 bg-muted rounded-lg text-left">
                <p className="text-sm font-mono text-destructive break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <Button onClick={this.handleReset} className="w-full">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload App
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Export with Sentry wrapper for additional error tracking
export const ErrorBoundary = Sentry.withErrorBoundary(ErrorBoundaryClass, {
  fallback: ({ error, resetError }) => (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Please try reloading the page.
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {(error as Error)?.message || 'Unknown error'}
            </p>
          </div>
        )}

        <Button onClick={resetError} className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  ),
  showDialog: false,
})
