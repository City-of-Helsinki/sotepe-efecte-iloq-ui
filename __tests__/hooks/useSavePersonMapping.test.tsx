import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useSavePersonMapping,
  SaveMappingError,
  getSaveMappingErrorMessage,
} from '@/hooks/useSavePersonMapping'
import { getDictionary } from '@/lib/i18n'
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

  it('passes the error code from the API to the error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Customer code is missing',
        code: 'CUSTOMER_CODE_MISSING',
      }),
    } as Response)

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(SaveMappingError)
    expect((result.current.error as SaveMappingError).code).toBe(
      'CUSTOMER_CODE_MISSING'
    )
  })

  it('treats a response without an error code as a save failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    } as unknown as Response)

    const { result } = renderHook(() => useSavePersonMapping(), { wrapper })

    result.current.mutate({
      personId: 'p1',
      realEstateId: 're1',
      keyId: 'k1',
      mapping: { entityId: '123456', efecteId: 'PER-00012345' },
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as SaveMappingError).code).toBe('SAVE_FAILED')
  })

  it('maps errors to translated messages', () => {
    const t = getDictionary('fi')

    expect(
      getSaveMappingErrorMessage(
        new SaveMappingError('x', 'CUSTOMER_CODE_MISSING'),
        t
      )
    ).toBe(t.toasts.customerCodeMissing)
    expect(
      getSaveMappingErrorMessage(new SaveMappingError('x', 'SAVE_FAILED'), t)
    ).toBe(t.toasts.saveFailed)
    expect(getSaveMappingErrorMessage(new Error('network'), t)).toBe(
      t.toasts.saveFailed
    )
  })
})
