import type { AuditRecord } from '@/types'

interface SyncInformationProps {
  keyData: AuditRecord
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp)
    return (
      date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }) +
      ` at ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    )
  } catch {
    return timestamp
  }
}

export function SyncInformation({ keyData }: SyncInformationProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Sync Information</h3>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium">Timestamp:</span>{' '}
          {formatTimestamp(keyData.timestamp)}
        </div>
        <div>
          <span className="font-medium">Direction:</span> {keyData.from} →{' '}
          {keyData.to}
        </div>
        <div>
          <span className="font-medium">Failure Reason:</span> {keyData.message}
        </div>
      </div>
    </div>
  )
}
