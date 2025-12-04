import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KeyDetails } from '@/components/non-synced-keys/modal-sections/KeyDetails'
import type { AuditRecord } from '@/types'

describe('KeyDetails', () => {
  const mockKeyData: AuditRecord = {
    id: '1',
    timestamp: '2025-11-02T14:02:00.000Z',
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Test message',
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

  it('renders key details correctly', () => {
    render(<KeyDetails keyData={mockKeyData} />)

    expect(screen.getByText('Key Details')).toBeInTheDocument()
    expect(screen.getByText('Main Door Key')).toBeInTheDocument()
    expect(screen.getByText('Building A')).toBeInTheDocument()
  })

  it('displays key state with description', () => {
    render(<KeyDetails keyData={mockKeyData} />)

    expect(screen.getByText(/State:/)).toBeInTheDocument()
    expect(
      screen.getByText(/Key is handed over to a person/)
    ).toBeInTheDocument()
  })

  it('shows security accesses when available', () => {
    const keyDataWithAccess: AuditRecord = {
      ...mockKeyData,
      iloqKey: {
        ...mockKeyData.iloqKey,
        securityAccesses: [
          { Name: 'Main Entrance', RealEstate_ID: 're-1', SecurityAccess_ID: '1' },
          { Name: 'Back Door', RealEstate_ID: 're-1', SecurityAccess_ID: '2' },
        ],
      },
    }

    render(<KeyDetails keyData={keyDataWithAccess} />)

    expect(screen.getByText('Security Accesses:')).toBeInTheDocument()
    expect(screen.getByText('Main Entrance')).toBeInTheDocument()
    expect(screen.getByText('Back Door')).toBeInTheDocument()
  })

  it('does not show security accesses when empty', () => {
    render(<KeyDetails keyData={mockKeyData} />)

    expect(screen.queryByText('Security Accesses:')).not.toBeInTheDocument()
  })

  it('displays dash when description is missing', () => {
    const keyDataNoDescription: AuditRecord = {
      ...mockKeyData,
      iloqKey: {
        ...mockKeyData.iloqKey,
        description: '',
      },
    }

    render(<KeyDetails keyData={keyDataNoDescription} />)

    // The dash is a separate text node, so just check it exists in the document
    const dashElements = screen.getAllByText('-')
    expect(dashElements.length).toBeGreaterThan(0)
  })

  it('handles all key states correctly', () => {
    const states = [
      { state: 0, description: 'Key is in planning state' },
      { state: 1, description: 'Key is handed over to a person' },
      {
        state: 2,
        description: "Key is hidden and shouldn't be displayed by default",
      },
      {
        state: 3,
        description:
          'Key is deleted but remains in the system for logging purposes',
      },
      { state: 4, description: 'Key is returned' },
    ]

    states.forEach(({ state, description }) => {
      const keyDataWithState: AuditRecord = {
        ...mockKeyData,
        iloqKey: {
          ...mockKeyData.iloqKey,
          state: state,
        },
      }

      const { unmount } = render(<KeyDetails keyData={keyDataWithState} />)
      expect(screen.getByText(new RegExp(description))).toBeInTheDocument()
      unmount()
    })
  })

  it('shows unknown state for invalid state number', () => {
    const keyDataInvalidState: AuditRecord = {
      ...mockKeyData,
      iloqKey: {
        ...mockKeyData.iloqKey,
        state: 999,
      },
    }

    render(<KeyDetails keyData={keyDataInvalidState} />)

    expect(screen.getByText(/Unknown state/)).toBeInTheDocument()
  })
})
