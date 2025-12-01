import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEfectePersons } from '@/hooks/useEfectePersons'
import type { ReactNode } from 'react'

// Mock fetch
global.fetch = vi.fn()

describe('useEfectePersons', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('fetches Efecte persons successfully when personId is provided', async () => {
    const mockPersons = [
      {
        id: '123',
        name: 'John Doe',
        attributes: [
          { id: 'entityId', name: 'Entity ID', values: ['123456'] },
          { id: 'efecteId', name: 'Efecte ID', values: ['PER-00012345'] },
        ],
      },
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ persons: mockPersons }),
    } as Response)

    const { result } = renderHook(() => useEfectePersons('p1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPersons)
    expect(fetch).toHaveBeenCalledWith('/api/redis/efecte-persons?personId=p1')
  })

  it('does not fetch when personId is null', async () => {
    const { result } = renderHook(() => useEfectePersons(null), { wrapper })

    expect(result.current.data).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns empty array on 404', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    const { result } = renderHook(() => useEfectePersons('p1'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })

  it('handles fetch errors for non-404 statuses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response)

    const { result } = renderHook(() => useEfectePersons('p1'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('handles network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useEfectePersons('p1'), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('updates when personId changes from null to value', async () => {
    const mockPersons = [
      {
        id: '123',
        name: 'John Doe',
        attributes: [],
      },
    ]

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ persons: mockPersons }),
    } as Response)

    const { result, rerender } = renderHook(
      ({ personId }) => useEfectePersons(personId),
      {
        wrapper,
        initialProps: { personId: null as string | null },
      }
    )

    expect(fetch).not.toHaveBeenCalled()

    rerender({ personId: 'p1' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPersons)
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
