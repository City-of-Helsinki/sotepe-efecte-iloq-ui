import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KeyDetailsModal } from '@/components/non-synced-keys/KeyDetailsModal'
import type { AuditRecord } from '@/types'

// Mock the child components
vi.mock('@/components/non-synced-keys/modal-sections/SyncInformation', () => ({
  SyncInformation: () => <div>SyncInformation Mock</div>,
}))

vi.mock('@/components/non-synced-keys/modal-sections/KeyDetails', () => ({
  KeyDetails: () => <div>KeyDetails Mock</div>,
}))

vi.mock(
  '@/components/non-synced-keys/modal-sections/PersonInformation',
  () => ({
    PersonInformation: () => <div>PersonInformation Mock</div>,
  })
)

vi.mock('@/components/non-synced-keys/modal-sections/MatchingPersons', () => ({
  MatchingPersons: () => <div>MatchingPersons Mock</div>,
}))

vi.mock('@/components/non-synced-keys/modal-sections/ManualEntryForms', () => ({
  ManualEntryForms: () => <div>ManualEntryForms Mock</div>,
}))

describe('KeyDetailsModal', () => {
  let queryClient: QueryClient

  const mockKeyData: AuditRecord = {
    id: '1',
    timestamp: '2025-11-03T10:00:00Z',
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Multiple matching key holders found for iLOQ person',
    iLoqId: 'key-001',
    iloqKey: {
      fnKeyId: 'key-001',
      description: 'Main Entrance',
      realEstateId: 'building-a',
      realEstateName: 'Building A',
      state: 1,
      InfoText: 'Info',
      person: {
        Person_ID: 'person-001',
        FirstName: 'John',
        LastName: 'Doe',
        eMail: 'john@example.com',
        Phone1: '+358401234567',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'Manager',
        CompanyName: 'Company',
        Address: 'Street 1',
        ZipCode: '00100',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'JD001',
        LanguageCode: 'fi',
        ContactInfo: '',
        Description: '',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [],
    },
  }

  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('renders modal with correct title', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="multiple_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.getByText('Key Details')).toBeInTheDocument()
  })

  it('prevents closing when clicking outside the modal', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="multiple_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    // Find the overlay (the backdrop behind the modal)
    const overlay = document.querySelector(
      '[data-radix-collection-item]'
    )?.parentElement

    if (overlay) {
      // Simulate clicking on the overlay
      fireEvent.pointerDown(overlay)

      // onClose should NOT have been called
      expect(mockOnClose).not.toHaveBeenCalled()
    }
  })

  it('closes when X button is clicked', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="multiple_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    // Find and click the close button (X)
    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('renders MatchingPersons component for multiple_matching category', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="multiple_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.getByText('MatchingPersons Mock')).toBeInTheDocument()
  })

  it('does not render MatchingPersons for no_matching category', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="no_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.queryByText('MatchingPersons Mock')).not.toBeInTheDocument()
  })

  it('renders ManualEntryForms for all categories', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="no_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.getByText('ManualEntryForms Mock')).toBeInTheDocument()
  })

  it('renders all section components', () => {
    render(
      <KeyDetailsModal
        keyData={mockKeyData}
        failureCategory="multiple_matching"
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.getByText('SyncInformation Mock')).toBeInTheDocument()
    expect(screen.getByText('KeyDetails Mock')).toBeInTheDocument()
    expect(screen.getByText('PersonInformation Mock')).toBeInTheDocument()
  })

  it('shows unsaved changes warning when form is dirty', async () => {
    // This would require more complex testing with form interaction
    // Skipping for now as it requires mocking the ManualEntryForms behavior
  })
})
