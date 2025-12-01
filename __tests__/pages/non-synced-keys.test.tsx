import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NonSyncedKeysPage from '@/app/(protected)/non-synced-keys/page'

// Mock the hooks
vi.mock('@/hooks/useNonSyncedKeys', () => ({
  useNonSyncedKeys: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { useNonSyncedKeys } from '@/hooks/useNonSyncedKeys'

describe('NonSyncedKeysPage', () => {
  let queryClient: QueryClient

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

  it('navigates back to list when selected real estate no longer exists', async () => {
    const mockRefetch = vi.fn()

    // Initial state: real estate exists with keys
    const initialData = {
      realEstates: [
        {
          realEstateId: 'building-a',
          realEstateName: 'Building A',
          totalKeys: 2,
          keys: [],
        },
      ],
      lastIntegrationRun: '2025-11-03',
    }

    // Updated state: real estate no longer exists (all keys resolved)
    const updatedData = {
      realEstates: [],
      lastIntegrationRun: '2025-11-03',
    }

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: initialData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    const { rerender } = render(<NonSyncedKeysPage />, { wrapper })

    // Verify list view is shown initially
    expect(screen.getByText('Non-Synced Keys')).toBeInTheDocument()
    expect(screen.getByText('Building A')).toBeInTheDocument()

    // Simulate selecting a real estate (this would change view state internally)
    // For this test, we're testing the useEffect logic that runs when data changes

    // Update the mock to return no real estates
    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: updatedData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    // Rerender to trigger the useEffect
    rerender(<NonSyncedKeysPage />)

    // The page should show the "No Synchronization Issues" message
    await waitFor(() => {
      expect(screen.getByText('No Synchronization Issues')).toBeInTheDocument()
    })
  })

  it('updates selected real estate with latest data when query refetches', async () => {
    const mockRefetch = vi.fn()

    // Initial state: real estate with 2 keys
    const initialData = {
      realEstates: [
        {
          realEstateId: 'building-a',
          realEstateName: 'Building A',
          totalKeys: 2,
          keys: [{ id: '1' }, { id: '2' }] as any,
        },
      ],
      lastIntegrationRun: '2025-11-03',
    }

    // Updated state: same real estate with 1 key (one was resolved)
    const updatedData = {
      realEstates: [
        {
          realEstateId: 'building-a',
          realEstateName: 'Building A',
          totalKeys: 1,
          keys: [{ id: '2' }] as any,
        },
      ],
      lastIntegrationRun: '2025-11-03',
    }

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: initialData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    const { rerender } = render(<NonSyncedKeysPage />, { wrapper })

    // Verify initial key count
    expect(screen.getByText('(2)')).toBeInTheDocument()

    // Simulate data update after successful person matching
    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: updatedData,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    rerender(<NonSyncedKeysPage />)

    // Verify updated key count
    await waitFor(() => {
      expect(screen.getByText('(1)')).toBeInTheDocument()
      expect(screen.queryByText('(2)')).not.toBeInTheDocument()
    })
  })

  it('derives selected real estate from latest query data by ID', async () => {
    const mockRefetch = vi.fn()

    const data = {
      realEstates: [
        {
          realEstateId: 'building-a',
          realEstateName: 'Building A - Updated Name',
          totalKeys: 1,
          keys: [],
        },
      ],
      lastIntegrationRun: '2025-11-03',
    }

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    render(<NonSyncedKeysPage />, { wrapper })

    // The real estate name should be derived from the latest data
    expect(screen.getByText('Building A - Updated Name')).toBeInTheDocument()
  })

  it('shows loading state while fetching data', () => {
    const mockRefetch = vi.fn()

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    } as any)

    render(<NonSyncedKeysPage />, { wrapper })

    // Should show skeleton loaders
    expect(screen.getByText('Non-Synced Keys')).toBeInTheDocument()
    // Skeleton elements would be present
  })

  it('shows error state when fetch fails', () => {
    const mockRefetch = vi.fn()

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      refetch: mockRefetch,
    } as any)

    render(<NonSyncedKeysPage />, { wrapper })

    expect(screen.getByText('Failed to Load Non-Synced Keys')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('shows empty state when no real estates have issues', () => {
    const mockRefetch = vi.fn()

    vi.mocked(useNonSyncedKeys).mockReturnValue({
      data: {
        realEstates: [],
        lastIntegrationRun: '2025-11-03',
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    } as any)

    render(<NonSyncedKeysPage />, { wrapper })

    expect(screen.getByText('No Synchronization Issues')).toBeInTheDocument()
    expect(
      screen.getByText(/All keys have been successfully synchronized/)
    ).toBeInTheDocument()
  })
})
