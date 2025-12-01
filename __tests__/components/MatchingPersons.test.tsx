import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MatchingPersons } from '@/components/non-synced-keys/modal-sections/MatchingPersons'
import type { AuditRecord, EfectePerson } from '@/types'

// Mock the hooks
vi.mock('@/hooks/useEfectePersons', () => ({
  useEfectePersons: vi.fn(),
}))

vi.mock('@/hooks/useSavePersonMapping', () => ({
  useSavePersonMapping: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useEfectePersons } from '@/hooks/useEfectePersons'
import { useSavePersonMapping } from '@/hooks/useSavePersonMapping'

describe('MatchingPersons', () => {
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

  const mockEfectePersons: EfectePerson[] = [
    {
      id: '123456',
      name: 'John Doe',
      attributes: [
        {
          id: '3537',
          name: 'entity_id',
          code: 'person_entityid',
          value: '123456',
        },
        {
          id: '1350',
          name: 'Efecte ID',
          code: 'efecte_id',
          value: 'PER-00012345',
        },
        { id: '1338', name: 'Koko nimi', code: 'full_name', value: 'John Doe' },
        {
          id: '1341',
          name: 'Sähköposti',
          code: 'email',
          value: 'john.doe@helsinki.fi',
        },
        {
          id: '1340',
          name: 'Matkapuhelin',
          code: 'mobile',
          value: '+358401234567',
        },
        {
          id: '1343',
          name: 'Puhelinnumero',
          code: 'phone',
          value: '(09) 310 11111',
        },
        { id: '1339', name: 'Titteli', code: 'title', value: 'Manager' },
        {
          id: '1769',
          name: 'Department',
          code: 'department',
          value: 'IT Services',
        },
        {
          id: '1770',
          name: 'Office',
          code: 'office',
          value: 'Helsinki Office',
        },
        { id: '1782', name: 'Status', code: 'status', value: 'Active' },
      ],
    },
    {
      id: '789012',
      name: 'John Doe',
      attributes: [
        {
          id: '3537',
          name: 'entity_id',
          code: 'person_entityid',
          value: '789012',
        },
        {
          id: '1350',
          name: 'Efecte ID',
          code: 'efecte_id',
          value: 'PER-00067890',
        },
        { id: '1338', name: 'Koko nimi', code: 'full_name', value: 'John Doe' },
        {
          id: '1341',
          name: 'Sähköposti',
          code: 'email',
          value: 'j.doe@helsinki.fi',
        },
        {
          id: '1340',
          name: 'Matkapuhelin',
          code: 'mobile',
          value: '+358407654321',
        },
        {
          id: '1343',
          name: 'Puhelinnumero',
          code: 'phone',
          value: '(09) 310 22222',
        },
        { id: '1339', name: 'Titteli', code: 'title', value: 'Senior Manager' },
        { id: '1769', name: 'Department', code: 'department', value: 'HR' },
        { id: '1770', name: 'Office', code: 'office', value: 'Espoo Office' },
        { id: '1782', name: 'Status', code: 'status', value: 'Active' },
      ],
    },
  ]

  const mockOnSuccess = vi.fn()
  const mockMutate = vi.fn()

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()

    vi.mocked(useSavePersonMapping).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as any)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('extracts entity ID from person_entityid attribute code', async () => {
    vi.mocked(useEfectePersons).mockReturnValue({
      data: mockEfectePersons,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    await waitFor(() => {
      expect(screen.getByText('123456')).toBeInTheDocument()
      expect(screen.getByText('789012')).toBeInTheDocument()
    })
  })

  it('extracts Efecte ID from efecte_id attribute code', async () => {
    vi.mocked(useEfectePersons).mockReturnValue({
      data: mockEfectePersons,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    await waitFor(() => {
      expect(screen.getByText('PER-00012345')).toBeInTheDocument()
      expect(screen.getByText('PER-00067890')).toBeInTheDocument()
    })
  })

  it('displays all person attributes using attribute codes', async () => {
    vi.mocked(useEfectePersons).mockReturnValue({
      data: mockEfectePersons,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    await waitFor(() => {
      // Check that attributes are displayed correctly
      expect(screen.getByText('john.doe@helsinki.fi')).toBeInTheDocument()
      expect(screen.getByText('IT Services')).toBeInTheDocument()
      expect(screen.getByText('Helsinki Office')).toBeInTheDocument()
      expect(screen.getByText('Manager')).toBeInTheDocument()
    })
  })

  it('sends correct entity ID and Efecte ID when matching person', async () => {
    const user = userEvent.setup()

    vi.mocked(useEfectePersons).mockReturnValue({
      data: mockEfectePersons,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    // Click select button for first person
    const selectButtons = await screen.findAllByRole('button', {
      name: 'Select',
    })
    await user.click(selectButtons[0])

    // Confirm in the dialog
    const confirmButton = await screen.findByRole('button', { name: 'Confirm' })
    await user.click(confirmButton)

    // Verify the mutation was called with correct data
    expect(mockMutate).toHaveBeenCalledWith({
      personId: 'person-001',
      realEstateId: 'building-a',
      keyId: 'key-001',
      mapping: {
        entityId: '123456',
        efecteId: 'PER-00012345',
      },
    })
  })

  it('shows confirmation dialog with entity ID and Efecte ID on separate lines', async () => {
    const user = userEvent.setup()

    vi.mocked(useEfectePersons).mockReturnValue({
      data: mockEfectePersons,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    // Click select button for first person
    const selectButtons = await screen.findAllByRole('button', {
      name: 'Select',
    })
    await user.click(selectButtons[0])

    // Verify confirmation message contains both IDs
    await waitFor(() => {
      expect(screen.getByText(/Entity ID: 123456/)).toBeInTheDocument()
      expect(screen.getByText(/Efecte ID: PER-00012345/)).toBeInTheDocument()
    })
  })

  it('handles missing attributes gracefully', async () => {
    const personWithMissingAttrs: EfectePerson[] = [
      {
        id: '999999',
        name: 'Incomplete Person',
        attributes: [
          {
            id: '3537',
            name: 'entity_id',
            code: 'person_entityid',
            value: '999999',
          },
          {
            id: '1350',
            name: 'Efecte ID',
            code: 'efecte_id',
            value: 'PER-00099999',
          },
          // Missing other attributes
        ],
      },
    ]

    vi.mocked(useEfectePersons).mockReturnValue({
      data: personWithMissingAttrs,
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    await waitFor(() => {
      // Entity ID and Efecte ID should be present
      expect(screen.getByText('999999')).toBeInTheDocument()
      expect(screen.getByText('PER-00099999')).toBeInTheDocument()

      // Missing attributes should show as '-'
      const dashElements = screen.getAllByText('-')
      expect(dashElements.length).toBeGreaterThan(0)
    })
  })

  it('shows loading state while fetching persons', () => {
    vi.mocked(useEfectePersons).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows error state when no persons found', () => {
    vi.mocked(useEfectePersons).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any)

    render(
      <MatchingPersons
        personId="person-001"
        keyData={mockKeyData}
        onSuccess={mockOnSuccess}
      />,
      { wrapper }
    )

    expect(
      screen.getByText('Unable to load matching persons from Efecte')
    ).toBeInTheDocument()
  })
})
