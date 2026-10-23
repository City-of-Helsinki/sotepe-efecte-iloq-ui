import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/navbar/Navbar'
import { getDictionary } from '@/lib/i18n'

const t = getDictionary('fi')

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

    expect(screen.getByText(t.nav.dashboard)).toBeInTheDocument()
    expect(screen.getByText(t.nav.nonSyncedKeys)).toBeInTheDocument()
  })

  it('renders app title', () => {
    render(<Navbar />)

    expect(screen.getByText(t.common.appName)).toBeInTheDocument()
  })

  it('has correct link hrefs', () => {
    render(<Navbar />)

    const dashboardLink = screen.getByText(t.nav.dashboard).closest('a')
    const nonSyncedKeysLink = screen.getByText(t.nav.nonSyncedKeys).closest('a')

    expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    expect(nonSyncedKeysLink).toHaveAttribute('href', '/non-synced-keys')
  })

  it('highlights active dashboard link', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Navbar />)

    const dashboardLink = screen.getByText(t.nav.dashboard)
    expect(dashboardLink.className).toContain('text-primary')
  })

  it('does not highlight inactive links', () => {
    mockUsePathname.mockReturnValue('/dashboard')

    render(<Navbar />)

    const nonSyncedKeysLink = screen.getByText(t.nav.nonSyncedKeys)
    expect(nonSyncedKeysLink.className).toContain('text-muted-foreground')
  })

  it('highlights active non-synced-keys link', () => {
    mockUsePathname.mockReturnValue('/non-synced-keys')

    render(<Navbar />)

    const dashboardLink = screen.getByText(t.nav.dashboard)
    const nonSyncedKeysLink = screen.getByText(t.nav.nonSyncedKeys)

    expect(dashboardLink.className).toContain('text-muted-foreground')
    expect(nonSyncedKeysLink.className).toContain('text-primary')
  })

  it('shows the application version when it is available', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '1.2.0')
    render(<Navbar />)

    expect(screen.getByText('v1.2.0')).toBeInTheDocument()
    vi.unstubAllEnvs()
  })

  it('does not show a version when it is not available', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_VERSION', '')
    render(<Navbar />)

    expect(screen.queryByText(/^v\d/)).not.toBeInTheDocument()
    vi.unstubAllEnvs()
  })
})
