'use client'

import type { AuditRecord } from '@/types'
import { useI18n } from '@/components/providers/language-provider'
import { formatDateTime, type Language } from '@/lib/i18n'

interface SyncInformationProps {
  keyData: AuditRecord
}

function formatTimestamp(timestamp: string, language: Language): string {
  const date = new Date(timestamp)

  return Number.isNaN(date.getTime())
    ? timestamp
    : formatDateTime(date, language)
}

export function SyncInformation({ keyData }: SyncInformationProps) {
  const { t, language } = useI18n()

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">{t.syncInformation.title}</h3>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium">{t.syncInformation.timestamp}</span>{' '}
          {formatTimestamp(keyData.timestamp, language)}
        </div>
        <div>
          <span className="font-medium">{t.syncInformation.failureReason}</span>{' '}
          {keyData.message}
        </div>
      </div>
    </div>
  )
}
