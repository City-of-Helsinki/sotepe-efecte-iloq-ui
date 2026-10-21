import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { KeyListView } from '@/components/non-synced-keys/KeyListView'
import { getDictionary } from '@/lib/i18n'
import type { RealEstateGroup } from '@/types'
import { MESSAGES, createAuditRecord } from '../fixtures/auditRecords'

vi.mock('@/components/non-synced-keys/KeyDetailsModal', () => ({
  KeyDetailsModal: ({ failureCategory }: { failureCategory: string }) => (
    <div>KeyDetailsModal Mock: {failureCategory}</div>
  ),
}))

const t = getDictionary('fi')

const realEstate: RealEstateGroup = {
  realEstateId: 'building-a',
  realEstateName: 'Building A',
  totalKeys: 4,
  keys: [
    createAuditRecord('1', MESSAGES.outsider),
    createAuditRecord('2', MESSAGES.noMatching),
    createAuditRecord('3', MESSAGES.multipleMatching),
    createAuditRecord('4', MESSAGES.noMatching),
    createAuditRecord('5', MESSAGES.technical),
  ],
}

describe('KeyListView', () => {
  it('shows the categories in display order with key counts', () => {
    render(<KeyListView realEstate={realEstate} />)

    const titles = screen
      .getAllByRole('button', { expanded: false })
      .map(button => button.textContent)

    expect(titles).toEqual([
      `${t.categories.multiple_matching.title} (${t.nonSyncedKeys.keyCount(1)})`,
      `${t.categories.no_matching.title} (${t.nonSyncedKeys.keyCount(2)})`,
      `${t.categories.outsider_without_key_card.title} (${t.nonSyncedKeys.keyCount(1)})`,
    ])
  })

  it('does not show a sync direction heading', () => {
    render(<KeyListView realEstate={realEstate} />)

    expect(screen.queryByText(/Direction/)).not.toBeInTheDocument()
    expect(screen.queryByText(/iLOQ → Efecte/)).not.toBeInTheDocument()
  })

  it('does not show technical failures', async () => {
    const user = userEvent.setup()
    render(<KeyListView realEstate={realEstate} />)

    for (const button of screen.getAllByRole('button', { expanded: false })) {
      await user.click(button)
    }

    expect(screen.queryByText(/Key 5/)).not.toBeInTheDocument()
  })

  it('shows the category guidance and keys when a category is expanded', async () => {
    const user = userEvent.setup()
    render(<KeyListView realEstate={realEstate} />)

    expect(
      screen.queryByText(t.categories.no_matching.description)
    ).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(t.categories.no_matching.title),
      })
    )

    expect(
      screen.getByText(t.categories.no_matching.description)
    ).toBeInTheDocument()
    t.categories.no_matching.options.forEach(option => {
      expect(screen.getByText(option)).toBeInTheDocument()
    })
    expect(screen.getByText(/Key 2/)).toBeInTheDocument()
    expect(screen.getByText(/Key 4/)).toBeInTheDocument()
  })

  it('opens the key details with the category of the key', async () => {
    const user = userEvent.setup()
    render(<KeyListView realEstate={realEstate} />)

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(t.categories.outsider_without_key_card.title),
      })
    )
    await user.click(screen.getByText(/Key 1/))

    expect(
      screen.getByText('KeyDetailsModal Mock: outsider_without_key_card')
    ).toBeInTheDocument()
  })

  it('shows the key without empty parentheses when the person name is missing', async () => {
    const user = userEvent.setup()
    const record = createAuditRecord('9', MESSAGES.outsider)
    record.iloqKey.person = { Person_ID: 'person-9' } as any

    render(
      <KeyListView
        realEstate={{ ...realEstate, totalKeys: 1, keys: [record] }}
      />
    )

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(t.categories.outsider_without_key_card.title),
      })
    )

    expect(screen.getByText('Key 9')).toBeInTheDocument()
    expect(screen.queryByText(/\(\s*\)/)).not.toBeInTheDocument()
  })
})
