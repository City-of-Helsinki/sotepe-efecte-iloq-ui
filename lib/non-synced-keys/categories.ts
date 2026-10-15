import type { AuditRecord, FailureCategory } from '@/types'

// Display order of the categories
export const FAILURE_CATEGORIES: FailureCategory[] = [
  'multiple_matching',
  'no_matching',
  'outsider_without_key_card',
]

// The category is resolved from the audit message written by the integration
export function categorizeAuditMessage(
  message: string
): FailureCategory | null {
  if (message.startsWith('Multiple matching key holders found')) {
    return 'multiple_matching'
  }

  if (
    message.startsWith(
      'Unable to create a new key card in Efecte. No matching key holder'
    )
  ) {
    return 'no_matching'
  }

  if (
    message.startsWith('The iLOQ person (') &&
    message.includes('is an outsider')
  ) {
    return 'outsider_without_key_card'
  }

  // Technical failures cannot be fixed by the user, they are followed in Sentry instead
  return null
}

export function isShownInUi(record: AuditRecord): boolean {
  return categorizeAuditMessage(record.message) !== null
}
