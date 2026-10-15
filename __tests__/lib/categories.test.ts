import { describe, it, expect } from 'vitest'
import {
  categorizeAuditMessage,
  FAILURE_CATEGORIES,
} from '@/lib/non-synced-keys/categories'

describe('categorizeAuditMessage', () => {
  it('recognizes the messages written by the integration', () => {
    expect(
      categorizeAuditMessage(
        "Multiple matching key holders found for iLOQ person 'John Doe' at Efecte"
      )
    ).toBe('multiple_matching')
    expect(
      categorizeAuditMessage(
        'Unable to create a new key card in Efecte. No matching key holder was found for the specified iLOQ person (abc-123).'
      )
    ).toBe('no_matching')
    expect(
      categorizeAuditMessage(
        "The iLOQ person (abc-123) is an outsider, and we currently don't create Efecte keys for outsiders."
      )
    ).toBe('outsider_without_key_card')
  })

  it.each([
    'Creating Efecte key failed. Server response: <error/>',
    'Updating Efecte key failed. Server response: <error/>',
    'The Efecte request was invalid. Server response: <error/>',
    'Processing an iLOQ key failed (operation: update). Server response: error',
    'Updating iLOQ security accesses failed. Server response: error',
    'No matching key holder / outsider found',
  ])('does not show technical failures in the UI: %s', message => {
    expect(categorizeAuditMessage(message)).toBeNull()
  })

  it('lists the categories in display order', () => {
    expect(FAILURE_CATEGORIES).toEqual([
      'multiple_matching',
      'no_matching',
      'outsider_without_key_card',
    ])
  })
})
