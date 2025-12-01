import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '@/app/api/redis/person-mapping/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/redis/operations', () => ({
  setRedisKey: vi.fn(),
  deleteRedisKey: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('POST /api/redis/person-mapping', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/redis/person-mapping', {
      method: 'POST',
      body: JSON.stringify({
        personId: 'p1',
        realEstateId: 're1',
        keyId: 'k1',
        mapping: { entityId: '123', efecteId: 'PER-00012345' },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when required fields are missing', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    const request = new NextRequest('http://localhost/api/redis/person-mapping', {
      method: 'POST',
      body: JSON.stringify({ personId: 'p1' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
  })

  it('saves person mapping successfully', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey, deleteRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockResolvedValue()
    vi.mocked(deleteRedisKey).mockResolvedValue()

    const request = new NextRequest('http://localhost/api/redis/person-mapping', {
      method: 'POST',
      body: JSON.stringify({
        personId: 'person-1',
        realEstateId: 're-1',
        keyId: 'key-1',
        mapping: { entityId: '123456', efecteId: 'PER-00012345' },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(setRedisKey).toHaveBeenCalled()
    expect(deleteRedisKey).toHaveBeenCalledTimes(2) // audit record + persons key
  })

  it('saves outsider mapping successfully', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey, deleteRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockResolvedValue()
    vi.mocked(deleteRedisKey).mockResolvedValue()

    const request = new NextRequest('http://localhost/api/redis/person-mapping', {
      method: 'POST',
      body: JSON.stringify({
        personId: 'person-1',
        realEstateId: 're-1',
        keyId: 'key-1',
        mapping: { outsiderName: 'John Doe', outsiderEmail: 'john@test.com' },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('returns 500 on Redis error', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockRejectedValue(new Error('Redis write failed'))

    const request = new NextRequest('http://localhost/api/redis/person-mapping', {
      method: 'POST',
      body: JSON.stringify({
        personId: 'person-1',
        realEstateId: 're-1',
        keyId: 'key-1',
        mapping: { entityId: '123456', efecteId: 'PER-00012345' },
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
