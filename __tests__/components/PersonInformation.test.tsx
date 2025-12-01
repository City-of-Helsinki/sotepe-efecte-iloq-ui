import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonInformation } from '@/components/non-synced-keys/modal-sections/PersonInformation'
import type { ILoqPerson } from '@/types'

describe('PersonInformation', () => {
  const mockPerson: ILoqPerson = {
    Person_ID: 'p1',
    FirstName: 'John',
    LastName: 'Doe',
    eMail: 'john.doe@example.com',
    Phone1: '+358401234567',
    Phone2: '+358501234567',
    Phone3: '',
    WorkTitle: 'Manager',
    CompanyName: 'Test Company',
    Address: '123 Test Street',
    ZipCode: '00100',
    PostOffice: 'Helsinki',
    Country: 'Finland',
    PersonCode: 'JD001',
    LanguageCode: 'en',
    ContactInfo: 'Contact via email',
    Description: 'Test person',
    EmploymentEndDate: '2025-12-31',
    State: 1,
    ExternalCanEdit: true,
    ExternalPersonId: 'ext-123',
  }

  it('renders person information header', () => {
    render(<PersonInformation person={mockPerson} />)

    expect(
      screen.getByText('Person Information (from iLOQ)')
    ).toBeInTheDocument()
  })

  it('displays all person fields correctly', () => {
    render(<PersonInformation person={mockPerson} />)

    expect(screen.getByText('John')).toBeInTheDocument()
    expect(screen.getByText('Doe')).toBeInTheDocument()
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('+358401234567')).toBeInTheDocument()
    expect(screen.getByText('Manager')).toBeInTheDocument()
    expect(screen.getByText('Test Company')).toBeInTheDocument()
    expect(screen.getByText('123 Test Street')).toBeInTheDocument()
    expect(screen.getByText('00100')).toBeInTheDocument()
    expect(screen.getByText('Helsinki')).toBeInTheDocument()
    expect(screen.getByText('Finland')).toBeInTheDocument()
  })

  it('displays dash for missing optional fields', () => {
    const personWithMissingFields: ILoqPerson = {
      Person_ID: 'p1',
      FirstName: '',
      LastName: '',
      eMail: '',
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
      EmploymentEndDate: '',
      State: 0,
      ExternalCanEdit: false,
      ExternalPersonId: '',
    }

    render(<PersonInformation person={personWithMissingFields} />)

    // Check that multiple dashes are present for empty fields
    const dashElements = screen.getAllByText('-')
    expect(dashElements.length).toBeGreaterThan(10)
  })

  it('displays ExternalCanEdit as true when true', () => {
    render(<PersonInformation person={mockPerson} />)

    const externalCanEditLabel = screen.getByText('External Can Edit:')
    const externalCanEditValue = externalCanEditLabel.parentElement?.textContent
    expect(externalCanEditValue).toContain('true')
  })

  it('displays ExternalCanEdit as false when false', () => {
    const personWithFalseFlag: ILoqPerson = {
      ...mockPerson,
      ExternalCanEdit: false,
    }

    render(<PersonInformation person={personWithFalseFlag} />)

    const externalCanEditLabel = screen.getByText('External Can Edit:')
    const externalCanEditValue = externalCanEditLabel.parentElement?.textContent
    expect(externalCanEditValue).toContain('false')
  })

  it('displays State value directly', () => {
    render(<PersonInformation person={mockPerson} />)

    const stateLabel = screen.getByText('State:')
    const stateValue = stateLabel.parentElement?.textContent
    expect(stateValue).toContain('1')
  })

  it('displays all phone numbers when provided', () => {
    render(<PersonInformation person={mockPerson} />)

    expect(screen.getByText('+358401234567')).toBeInTheDocument()
    expect(screen.getByText('+358501234567')).toBeInTheDocument()
  })

  it('displays external person ID when provided', () => {
    render(<PersonInformation person={mockPerson} />)

    expect(screen.getByText('ext-123')).toBeInTheDocument()
  })

  it('renders in grid layout', () => {
    const { container } = render(<PersonInformation person={mockPerson} />)

    const gridElement = container.querySelector('.grid.grid-cols-2')
    expect(gridElement).toBeInTheDocument()
  })

  it('displays employment end date', () => {
    render(<PersonInformation person={mockPerson} />)

    expect(screen.getByText('2025-12-31')).toBeInTheDocument()
  })

  it('displays language code', () => {
    render(<PersonInformation person={mockPerson} />)

    const languageCodeLabel = screen.getByText('Language Code:')
    const languageCodeValue = languageCodeLabel.parentElement?.textContent
    expect(languageCodeValue).toContain('en')
  })
})
