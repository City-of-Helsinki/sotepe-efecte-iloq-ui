'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/components/providers/language-provider'

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const { t } = useI18n()

  useEffect(() => {
    // Send error to Sentry
    Sentry.captureException(error)
    console.error('Protected route error:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">{t.protectedErrorPage.title}</h1>
        <p className="text-gray-600">{t.protectedErrorPage.description}</p>
        <div className="flex gap-2">
          <Button onClick={reset} className="flex-1">
            {t.protectedErrorPage.tryAgain}
          </Button>
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="flex-1"
          >
            {t.protectedErrorPage.goToDashboard}
          </Button>
        </div>
      </div>
    </div>
  )
}
