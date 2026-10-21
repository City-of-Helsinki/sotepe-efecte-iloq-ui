import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { ManualEntryForms } from '@/components/non-synced-keys/modal-sections/ManualEntryForms'
import { getDictionary } from '@/lib/i18n'
import type { FailureCategory } from '@/types'
import { MESSAGES, createAuditRecord } from '../fixtures/auditRecords'

vi.mock('@/hooks/useSavePersonMapping', async importOriginal => ({
  ...(await importOriginal<typeof import('@/hooks/useSavePersonMapping')>()),
  useSavePersonMapping: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import {
  useSavePersonMapping,
  SaveMappingError,
} from '@/hooks/useSavePersonMapping'

const t = getDictionary('fi')
const keyData = createAuditRecord('1', MESSAGES.noMatching)

type MutationOptions = {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

describe('ManualEntryForms', () => {
  const mutate = vi.fn()
  let mutationOptions: MutationOptions = {}

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSavePersonMapping).mockImplementation(options => {
      mutationOptions = options ?? {}
      return { mutate, isPending: false } as any
    })
  })

  function renderForms(category: FailureCategory) {
    return render(
      <ManualEntryForms
        keyData={keyData}
        failureCategory={category}
        onSuccess={vi.fn()}
        onFormChange={vi.fn()}
      />
    )
  }

  async function fillMatchForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(t.forms.entityId), '392450')
    await user.type(screen.getByLabelText(t.forms.efecteId), 'PER-00028166')
    await user.click(screen.getByRole('button', { name: t.forms.matchSubmit }))
  }

  it('offers both actions without a preselection for multiple matching persons', () => {
    renderForms('multiple_matching')

    expect(screen.getByLabelText(t.forms.matchOption)).toBeInTheDocument()
    expect(screen.getByLabelText(t.forms.outsiderOption)).toBeInTheDocument()
    expect(screen.queryByLabelText(t.forms.entityId)).not.toBeInTheDocument()
  })

  it('shows the match form with field help when the key holder is not found', () => {
    renderForms('no_matching')

    expect(screen.getByLabelText(t.forms.outsiderOption)).toBeInTheDocument()
    expect(screen.getByText(t.forms.matchNote)).toBeInTheDocument()
    expect(screen.getByLabelText(t.forms.entityId)).toHaveAccessibleDescription(
      t.forms.entityIdHelp
    )
    expect(screen.getByLabelText(t.forms.efecteId)).toHaveAccessibleDescription(
      t.forms.efecteIdHelp
    )
  })

  it('prefills the outsider details for correcting them', async () => {
    const user = userEvent.setup()
    render(
      <ManualEntryForms
        keyData={keyData}
        failureCategory="outsider_without_key_card"
        onSuccess={vi.fn()}
        onFormChange={vi.fn()}
        initialOutsider={{
          outsiderName: 'Umid Usan',
          outsiderEmail: 'aulapalvelut@hel.fi',
        }}
      />
    )

    expect(screen.getByLabelText(t.forms.correctOutsiderOption)).toBeChecked()
    expect(screen.getByText(t.forms.correctOutsiderNote)).toBeInTheDocument()
    expect(screen.getByLabelText(t.forms.outsiderName)).toHaveValue('Umid Usan')
    expect(screen.getByLabelText(t.forms.outsiderEmail)).toHaveValue(
      'aulapalvelut@hel.fi'
    )

    // Unchanged details cannot be saved
    const submit = screen.getByRole('button', {
      name: t.forms.correctOutsiderSubmit,
    })
    expect(submit).toBeDisabled()

    await user.clear(screen.getByLabelText(t.forms.outsiderEmail))
    await user.type(
      screen.getByLabelText(t.forms.outsiderEmail),
      'umid@kavi.fi'
    )
    await user.click(submit)
    await user.click(screen.getByRole('button', { name: t.common.confirm }))

    expect(mutate).toHaveBeenCalledWith({
      personId: 'person-1',
      realEstateId: 'building-a',
      keyId: 'key-1',
      mapping: { outsiderName: 'Umid Usan', outsiderEmail: 'umid@kavi.fi' },
    })
  })

  it('offers matching with an Efecte person as a corrective action for an outsider', async () => {
    const user = userEvent.setup()
    renderForms('outsider_without_key_card')

    expect(
      screen.queryByLabelText(t.forms.outsiderOption)
    ).not.toBeInTheDocument()
    expect(screen.queryByText(t.forms.correctiveNote)).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(t.forms.correctiveMatchOption))

    expect(screen.getByText(t.forms.correctiveNote)).toBeInTheDocument()
    expect(screen.getByLabelText(t.forms.entityId)).toBeInTheDocument()
  })

  it('does not report unsaved changes for the prefilled outsider details', () => {
    const onFormChange = vi.fn()
    render(
      <ManualEntryForms
        keyData={keyData}
        failureCategory="outsider_without_key_card"
        onSuccess={vi.fn()}
        onFormChange={onFormChange}
        initialOutsider={{
          outsiderName: 'Umid Usan',
          outsiderEmail: 'aulapalvelut@hel.fi',
        }}
      />
    )

    expect(onFormChange).toHaveBeenLastCalledWith(false)
  })

  it('reminds that both ids must be from the same person card before saving', async () => {
    const user = userEvent.setup()
    renderForms('no_matching')

    await fillMatchForm(user)

    expect(
      screen.getByText(/Varmista, että Entity ID ja Efecte ID ovat saman/)
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: t.common.confirm }))

    expect(mutate).toHaveBeenCalledWith({
      personId: 'person-1',
      realEstateId: 'building-a',
      keyId: 'key-1',
      mapping: { entityId: '392450', efecteId: 'PER-00028166' },
    })
  })

  it('explains the outsider registration and reminds about the key card', async () => {
    const user = userEvent.setup()
    renderForms('no_matching')

    await user.click(screen.getByLabelText(t.forms.outsiderOption))

    expect(screen.getByText(t.forms.outsiderNote)).toBeInTheDocument()
    expect(
      screen.getByLabelText(t.forms.outsiderEmail)
    ).toHaveAccessibleDescription(t.forms.outsiderEmailHelp)

    await user.type(
      screen.getByLabelText(t.forms.outsiderName),
      'Rosa Outsider'
    )
    await user.type(
      screen.getByLabelText(t.forms.outsiderEmail),
      'rosa@example.com'
    )
    await user.click(
      screen.getByRole('button', { name: t.forms.outsiderSubmit })
    )

    expect(
      screen.getByText(/Avain synkronoituu vain, jos Efectessä on avainkortti/)
    ).toBeInTheDocument()
  })

  it('shows the success message after saving', async () => {
    renderForms('no_matching')

    mutationOptions.onSuccess?.()

    expect(toast.success).toHaveBeenCalledWith(t.toasts.matchSaved, {
      duration: 5000,
    })
  })

  it('shows a specific message when the row cannot be processed yet', () => {
    renderForms('no_matching')

    mutationOptions.onError?.(
      new SaveMappingError('missing', 'CUSTOMER_CODE_MISSING')
    )

    expect(toast.error).toHaveBeenCalledWith(t.toasts.customerCodeMissing, {
      duration: 5000,
    })
  })

  it('shows a general message for other save failures', () => {
    renderForms('no_matching')

    mutationOptions.onError?.(new SaveMappingError('boom', 'SAVE_FAILED'))

    expect(toast.error).toHaveBeenCalledWith(t.toasts.saveFailed, {
      duration: 5000,
    })
  })
})
