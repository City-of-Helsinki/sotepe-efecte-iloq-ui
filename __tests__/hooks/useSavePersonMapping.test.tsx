import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSavePersonMapping } from '@/hooks/useSavePersonMapping'
import type { ReactNode } from 'react'

// Mock fetch
globalThis.fetch = vi.fn()

describe('useSavePersonMapping', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('saves person mapping successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetch).toHaveBeenCalledWith('/api/redis/person-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personId: 'p1',
        realEstateId: 're1',
        keyId: 'k1',
        mapping: { entityId: '123456', efecteId: 'PER-00012345' },
      }),
    })
  })

  it('saves outsider mapping successfully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { outsiderName: 'John Doe', outsiderEmail: 'john@test.com' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(fetch).toHaveBeenCalledWith('/api/redis/person-mapping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personId: 'p1',
        realEstateId: 're1',
        keyId: 'k1',
        mapping: { outsiderName: 'John Doe', outsiderEmail: 'john@test.com' },
      }),
    })
  })

  it('handles mutation errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
    } as Response)

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('calls onSuccess callback when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useSavePersonMapping({ onSuccess }), {
      wrapper,
    })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('calls onError callback when provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)

    const onError = vi.fn()
    const { result } = renderHook(() => useSavePersonMapping({ onError }), {
      wrapper,
    })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('invalidates non-synced-keys query on success', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response)

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['non-synced-keys'],
    })
  })

  it('handles network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(Error)
  })
})
