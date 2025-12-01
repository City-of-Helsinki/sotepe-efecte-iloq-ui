import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar/Navbar'

// Create a mock function
const mockUsePathname = vi.fn()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}))

describe('Navbar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard')
  })

  it('renders navigation links', () => {
    render(<Navbar />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Non-Synced Keys')).toBeInTheDocument()
  })

  it('renders app title', () => {
    render(<Navbar />)

    expect(screen.getByText('Efecte-iLOQ Integration')).toBeInTheDocument()
  })

  it('has correct link hrefs', () => {
    render(<Navbar />)

    const dashboardLink = screen.getByText('Dashboard').closest('a')
    const nonSyncedKeysLink = screen.getByText('Non-Synced Keys').closest('a')

    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(nonSyncedKeysLink).toHaveAttribute('href', '/non-synced-keys')
  })

  it('highlights active dashboard link', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Navbar />)

    const dashboardLink = screen.getByText('Dashboard')
    expect(dashboardLink.className).toContain('text-primary')
  })

  it('does not highlight inactive links', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Navbar />)

    const nonSyncedKeysLink = screen.getByText('Non-Synced Keys')
    expect(nonSyncedKeysLink.className).toContain('text-muted-foreground')
  })

  it('highlights active non-synced-keys link', () => {
    mockUsePathname.mockReturnValue('/non-synced-keys')

    render(<Navbar />)

    const dashboardLink = screen.getByText('Dashboard')
    const nonSyncedKeysLink = screen.getByText('Non-Synced Keys')

    expect(dashboardLink.className).toContain('text-muted-foreground')
    expect(nonSyncedKeysLink.className).toContain('text-primary')
  })
})
