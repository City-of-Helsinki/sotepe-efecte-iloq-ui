import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncInformation } from '@/components/non-synced-keys/modal-sections/SyncInformation'
import type { AuditRecord } from '@/types'

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
      person: {
        Person_ID: 'p1',
        FirstName: 'John',
        LastName: 'Doe',
      },
      securityAccesses: [],
    },
  }

  it('renders sync information correctly', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(screen.getByText('Sync Information')).toBeInTheDocument()
    expect(screen.getByText(/Timestamp:/)).toBeInTheDocument()
    expect(screen.getByText(/Direction:/)).toBeInTheDocument()
    expect(screen.getByText(/Failure Reason:/)).toBeInTheDocument()
  })

  it('displays formatted timestamp', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    // The timestamp should be formatted as "Month Day, Year at HH:MM"
    expect(screen.getByText(/November 2, 2025 at/)).toBeInTheDocument()
  })

  it('displays sync direction with arrow', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(screen.getByText(/ILOQ → EFECTE/)).toBeInTheDocument()
  })

  it('displays failure message', () => {
    render(<SyncInformation keyData={mockKeyData} />)

    expect(
      screen.getByText('Multiple matching persons found')
    ).toBeInTheDocument()
  })

  it('handles EFECTE to ILOQ direction', () => {
    const keyDataReverse: AuditRecord = {
      ...mockKeyData,
      from: 'EFECTE',
      to: 'ILOQ',
    }

    render(<SyncInformation keyData={keyDataReverse} />)

    expect(screen.getByText(/EFECTE → ILOQ/)).toBeInTheDocument()
  })

  it('handles invalid timestamp gracefully', () => {
    const keyDataInvalidTimestamp: AuditRecord = {
      ...mockKeyData,
      timestamp: 'invalid-date',
    }

    render(<SyncInformation keyData={keyDataInvalidTimestamp} />)

    // When the date is invalid, it shows "Invalid Date at NaN:NaN"
    expect(screen.getByText(/Invalid Date/)).toBeInTheDocument()
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
