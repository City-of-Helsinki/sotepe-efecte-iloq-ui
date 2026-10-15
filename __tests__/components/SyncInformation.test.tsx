import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncInformation } from '@/components/non-synced-keys/modal-sections/SyncInformation'
import type { AuditRecord } from '@/types'
import { getDictionary, formatDateTime } from '@/lib/i18n'

const t = getDictionary('fi')

describe('SyncInformation', () => {
  const mockKeyData: AuditRecord = {
    id: '1',
    timestamp: '2025-11-02T14:02:00.000Z',
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Multiple matching persons found',
    iLoqId: 'key-1',
    iloqKey: {
      fnKeyId: 'key-1',
      description: 'Main Door Key',
      realEstateId: 're-1',
      realEstateName: 'Building A',
      state: 1,
      InfoText: '',
      person: {
        Person_ID: 'p1',
        FirstName: 'John',
        LastName: 'Doe',
        eMail: 'john.doe@example.com',
        Phone1: '',
        Phone2: '',
        Phone3: '',
        WorkTitle: '',
        CompanyName: '',
        Address: '',
        ZipCode: '',
        PostOffice: '',
        Country: '',
        PersonCode: '',
        LanguageCode: '',
        ContactInfo: '',
        Description: '',
        EmploymentEndDate: null,
        State: 0,
        ExternalCanEdit: false,
        ExternalPersonId: null,
      },
      securityAccesses: [],
    },
  }

  it('renders sync information correctly', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(screen.getByText(t.syncInformation.title)).toBeInTheDocument()
    expect(screen.getByText(t.syncInformation.timestamp)).toBeInTheDocument()
    expect(
      screen.getByText(t.syncInformation.failureReason)
    ).toBeInTheDocument()
  })

  it('displays formatted timestamp', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    // Formatted for the default language, e.g. "2.11.2025 klo 16.02"
    const expected = formatDateTime(new Date(mockKeyData.timestamp), 'fi')
    expect(screen.getByText(new RegExp(expected))).toBeInTheDocument()
    expect(expected).toMatch(/^2\.11\.2025 klo \d{1,2}\.02$/)
  })

  it('does not display the sync direction', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(screen.queryByText(/ILOQ → EFECTE/)).not.toBeInTheDocument()
  })

  it('displays failure message', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(
      screen.getByText('Multiple matching persons found')
    ).toBeInTheDocument()
  })

  it('handles invalid timestamp gracefully', () => {
    const keyDataInvalidTimestamp: AuditRecord = {
      ...mockKeyData,
      timestamp: 'invalid-date',
    }

    render(<SyncInformation keyData={keyDataInvalidTimestamp} />)

    // An invalid date is shown as it is
    expect(screen.getByText(/invalid-date/)).toBeInTheDocument()
  })

  it('displays different failure messages', () => {
    const messages = [
      'Multiple matching persons found',
      'No matching persons found',
      'Sync failed due to network error',
    ]

    messages.forEach(message => {
      const keyDataWithMessage: AuditRecord = {
        ...mockKeyData,
        message,
      }

      const { unmount } = render(
        <SyncInformation keyData={keyDataWithMessage} />
      )
      expect(screen.getByText(message)).toBeInTheDocument()
      unmount()
    })
  })
})
