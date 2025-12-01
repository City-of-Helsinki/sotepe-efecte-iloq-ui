'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>An unexpected error occurred. Please try again.</p>
          {error.digest && (
            <p className="text-sm text-gray-500">Error ID: {error.digest}</p>
          )}
          <Button onClick={reset} variant="outline" className="w-full">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
