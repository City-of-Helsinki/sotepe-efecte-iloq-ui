import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmationDialog } from '@/components/non-synced-keys/ConfirmationDialog'

describe('ConfirmationDialog', () => {
  const mockOnConfirm = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dialog with title and message', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(
      screen.getByText('Are you sure you want to proceed?')
    ).toBeInTheDocument()
  })

  it('displays Cancel and Confirm buttons', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  })

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmationDialog {...defaultProps} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('calls onConfirm when Confirm button is clicked', async () => {
    const user = userEvent.setup()
    render(<ConfirmationDialog {...defaultProps} />)

    const confirmButton = screen.getByRole('button', { name: 'Confirm' })
    await user.click(confirmButton)

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    expect(mockOnCancel).not.toHaveBeenCalled()
  })

  it('disables buttons when isLoading is true', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const confirmButton = screen.getByRole('button', { name: 'Confirming...' })

    expect(cancelButton).toBeDisabled()
    expect(confirmButton).toBeDisabled()
  })

  it('shows "Confirming..." text when loading', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={true} />)

    expect(screen.getByText('Confirming...')).toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('buttons are enabled when isLoading is false', () => {
    render(<ConfirmationDialog {...defaultProps} isLoading={false} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    const confirmButton = screen.getByRole('button', { name: 'Confirm' })

    expect(cancelButton).not.toBeDisabled()
    expect(confirmButton).not.toBeDisabled()
  })

  it('renders with custom title and message', () => {
    const customProps = {
      ...defaultProps,
      title: 'Delete Item',
      message: 'This action cannot be undone. Continue?',
    }

    render(<ConfirmationDialog {...customProps} />)

    expect(screen.getByText('Delete Item')).toBeInTheDocument()
    expect(
      screen.getByText('This action cannot be undone. Continue?')
    ).toBeInTheDocument()
  })

  it('dialog is open by default', () => {
    render(<ConfirmationDialog {...defaultProps} />)

    // Check that the dialog content is visible by verifying title is present
    expect(screen.getByText('Confirm Action')).toBeVisible()
  })

  it('applies whitespace-pre-line class to message for newline formatting', () => {
    const messageWithNewlines = 'Line 1\nLine 2\nLine 3'
    render(
      <ConfirmationDialog {...defaultProps} message={messageWithNewlines} />
    )

    const messageElement = screen.getByText(/Line 1/)
    expect(messageElement).toHaveClass('whitespace-pre-line')
  })

  it('renders multiline messages correctly', () => {
    const multilineMessage =
      'Are you sure?\n\nEntity ID: 123456\nEfecte ID: PER-00012345'
    render(<ConfirmationDialog {...defaultProps} message={multilineMessage} />)

    // The message should be present in the document
    expect(screen.getByText(/Are you sure\?/)).toBeInTheDocument()
    expect(screen.getByText(/Entity ID: 123456/)).toBeInTheDocument()
    expect(screen.getByText(/Efecte ID: PER-00012345/)).toBeInTheDocument()
  })
})
