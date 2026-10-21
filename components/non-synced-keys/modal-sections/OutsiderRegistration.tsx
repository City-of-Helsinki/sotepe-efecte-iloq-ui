'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { useI18n } from '@/components/providers/language-provider'
import type { OutsiderMapping } from '@/types'

interface OutsiderRegistrationProps {
  mapping: OutsiderMapping | null
  isLoading: boolean
  isError: boolean
}

// Shows the details the integration uses to look for the outsider key card in Efecte
export function OutsiderRegistration({
  mapping,
  isLoading,
  isError,
}: OutsiderRegistrationProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">{t.outsiderRegistration.title}</h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {t.outsiderRegistration.loadFailed}
          </AlertDescription>
        </Alert>
      ) : mapping ? (
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            {t.outsiderRegistration.description}
          </p>
          <div>
            <span className="font-medium">{t.outsiderRegistration.name}</span>{' '}
            {mapping.outsiderName}
          </div>
          <div>
            <span className="font-medium">{t.outsiderRegistration.email}</span>{' '}
            {mapping.outsiderEmail}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t.outsiderRegistration.notFound}
        </p>
      )}
    </div>
  )
}
