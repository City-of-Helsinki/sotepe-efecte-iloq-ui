import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/redis/integration-timestamp/route'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/redis/operations', () => ({
  getRedisKey: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('GET /api/redis/integration-timestamp', () => {
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

  it('returns timestamp when found', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockResolvedValue('2025:11:02 14:02:11')

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.timestamp).toBe('2025:11:02 14:02:11')
  })

  it('returns null when timestamp not found', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockResolvedValue(null)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.timestamp).toBeNull()
  })

  it('returns 500 on Redis error', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockRejectedValue(new Error('Redis error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
