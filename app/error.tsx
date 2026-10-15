'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useI18n } from '@/components/providers/language-provider'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useI18n()

  useEffect(() => {
    // Send error to Sentry
    Sentry.captureException(error)
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertTitle>{t.errorPage.title}</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p>{t.errorPage.description}</p>
          {error.digest && (
            <p className="text-sm text-gray-500">
              {t.errorPage.errorId(error.digest)}
            </p>
          )}
          <Button onClick={reset} variant="outline" className="w-full">
            {t.errorPage.tryAgain}
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  )
}
