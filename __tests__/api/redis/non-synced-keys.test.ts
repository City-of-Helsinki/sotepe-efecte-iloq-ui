import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/redis/non-synced-keys/route'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/redis/operations', () => ({
  getRedisKeysWithValues: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('GET /api/redis/non-synced-keys', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns non-synced keys when authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKeysWithValues } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    const mockKeys = [
      { key: 'test-key-1', value: '{"id":"1"}' },
      { key: 'test-key-2', value: '{"id":"2"}' },
    ]

    vi.mocked(getRedisKeysWithValues).mockResolvedValue(mockKeys)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.keys).toEqual(mockKeys)
    expect(data.keys).toHaveLength(2)
  })

  it('returns 500 on Redis error', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKeysWithValues } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKeysWithValues).mockRejectedValue(
      new Error('Redis connection failed')
    )

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
