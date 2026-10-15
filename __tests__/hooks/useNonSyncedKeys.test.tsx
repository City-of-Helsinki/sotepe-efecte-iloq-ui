import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNonSyncedKeys } from '@/hooks/useNonSyncedKeys'
import type { ReactNode } from 'react'

const MULTIPLE_MATCHING_MESSAGE =
  "Multiple matching key holders found for iLOQ person 'John Doe' at Efecte"
const NO_MATCHING_MESSAGE =
  'Unable to create a new key card in Efecte. No matching key holder was found for the specified iLOQ person (p2).'
const TECHNICAL_MESSAGE =
  'Creating Efecte key failed. Server response: <error>invalid</error>'

function auditRecordEntry(
  id: string,
  message: string,
  realEstateId: string,
  realEstateName: string
) {
  return {
    key: `efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:${realEstateId}:k${id}`,
    value: JSON.stringify({
      id,
      timestamp: '2025-11-02T14:02:00.000Z',
      from: 'ILOQ',
      to: 'EFECTE',
      message,
      iLoqId: `k${id}`,
      iloqKey: {
        fnKeyId: `k${id}`,
        description: `Key ${id}`,
        realEstateId,
        realEstateName,
        state: 1,
        person: { Person_ID: `p${id}`, FirstName: 'John', LastName: 'Doe' },
        securityAccesses: [],
      },
    }),
  }
}

// Mock fetch
globalThis.fetch = vi.fn()

describe('useNonSyncedKeys', () => {
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

  it('fetches and processes non-synced keys successfully', async () => {
    const mockKeysResponse = {
      keys: [
        {
          key: 'efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:key1',
          value: JSON.stringify({
            id: '1',
            timestamp: '2025-11-02T14:02:00.000Z',
            from: 'ILOQ',
            to: 'EFECTE',
            message: MULTIPLE_MATCHING_MESSAGE,
            iLoqId: 'k1',
            iloqKey: {
              fnKeyId: 'k1',
              description: 'Main Door Key',
              realEstateId: 're1',
              realEstateName: 'Building A',
              State: 1,
              person: {
                Person_ID: 'p1',
                firstName: 'John',
                lastName: 'Doe',
              },
              securityAccesses: [],
            },
          }),
        },
      ],
    }

    const mockTimestampResponse = {
      timestamp: '2025:11:02 14:02:11',
    }

    // Mock both fetch calls
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockKeysResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimestampResponse,
      } as Response)

    const { result } = renderHook(() => useNonSyncedKeys(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toBeDefined()
    expect(result.current.data?.realEstates).toHaveLength(1)
    expect(result.current.data?.realEstates[0].realEstateName).toBe(
      'Building A'
    )
    expect(result.current.data?.realEstates[0].totalKeys).toBe(1)
    // Parsed as a local date, it is formatted for the selected language when displayed
    expect(result.current.data?.lastIntegrationRun).toEqual(
      new Date(2025, 10, 2, 14, 2, 11)
    )
  })

  it('handles empty keys array', async () => {
    // Mock both fetch calls
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ keys: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timestamp: null }),
      } as Response)

    const { result } = renderHook(() => useNonSyncedKeys(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.realEstates).toHaveLength(0)
    expect(result.current.data?.lastIntegrationRun).toBeNull()
  })

  it('handles fetch errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)

    const { result } = renderHook(() => useNonSyncedKeys(), { wrapper })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })

  it('groups keys by real estate correctly', async () => {
    const mockKeysResponse = {
      keys: [
        {
          key: 'audit:key:1',
          value: JSON.stringify({
            id: '1',
            timestamp: '2025-11-02T14:02:00.000Z',
            from: 'ILOQ',
            to: 'EFECTE',
            message: MULTIPLE_MATCHING_MESSAGE,
            iLoqId: 'k1',
            iloqKey: {
              fnKeyId: 'k1',
              description: 'Key A',
              realEstateId: 're1',
              realEstateName: 'Building A',
              State: 1,
              person: { Person_ID: 'p1', firstName: 'John', lastName: 'Doe' },
              securityAccesses: [],
            },
          }),
        },
        {
          key: 'audit:key:2',
          value: JSON.stringify({
            id: '2',
            timestamp: '2025-11-02T14:02:00.000Z',
            from: 'ILOQ',
            to: 'EFECTE',
            message: NO_MATCHING_MESSAGE,
            iLoqId: 'k2',
            iloqKey: {
              fnKeyId: 'k2',
              description: 'Key B',
              realEstateId: 're1',
              realEstateName: 'Building A',
              State: 1,
              person: {
                Person_ID: 'p2',
                firstName: 'Jane',
                lastName: 'Smith',
              },
              securityAccesses: [],
            },
          }),
        },
        {
          key: 'audit:key:3',
          value: JSON.stringify({
            id: '3',
            timestamp: '2025-11-02T14:02:00.000Z',
            from: 'ILOQ',
            to: 'EFECTE',
            message: MULTIPLE_MATCHING_MESSAGE,
            iLoqId: 'k3',
            iloqKey: {
              fnKeyId: 'k3',
              description: 'Key C',
              realEstateId: 're2',
              realEstateName: 'Building B',
              State: 1,
              person: {
                fnPersonId: 'p3',
                FirstName: 'Bob',
                LastName: 'Johnson',
              },
              securityAccesses: [],
            },
          }),
        },
      ],
    }

    const mockTimestampResponse = {
      timestamp: '2025:11:02 14:02:11',
    }

    // Mock both fetch calls
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockKeysResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTimestampResponse,
      } as Response)

    const { result } = renderHook(() => useNonSyncedKeys(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.realEstates).toHaveLength(2)
    expect(result.current.data?.realEstates[0].realEstateName).toBe(
      'Building A'
    )
    expect(result.current.data?.realEstates[0].totalKeys).toBe(2)
    expect(result.current.data?.realEstates[1].realEstateName).toBe(
      'Building B'
    )
    expect(result.current.data?.realEstates[1].totalKeys).toBe(1)
  })

  it('leaves out technical failures, also from the real estate key counts', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          keys: [
            auditRecordEntry(
              '1',
              MULTIPLE_MATCHING_MESSAGE,
              're1',
              'Building A'
            ),
            auditRecordEntry('2', TECHNICAL_MESSAGE, 're1', 'Building A'),
            auditRecordEntry('3', TECHNICAL_MESSAGE, 're2', 'Building B'),
          ],
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ timestamp: null }),
      } as Response)

    const { result } = renderHook(() => useNonSyncedKeys(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Building B has only a technical failure, so it is not shown at all
    expect(result.current.data?.realEstates).toHaveLength(1)
    expect(result.current.data?.realEstates[0].realEstateName).toBe(
      'Building A'
    )
    expect(result.current.data?.realEstates[0].totalKeys).toBe(1)
    expect(result.current.data?.realEstates[0].keys[0].id).toBe('1')
  })
})
