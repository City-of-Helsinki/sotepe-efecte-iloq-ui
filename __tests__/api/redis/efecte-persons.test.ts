import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '@/app/api/redis/efecte-persons/route'
import { NextRequest } from 'next/server'

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

describe('GET /api/redis/efecte-persons', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/redis/efecte-persons?personId=test-id'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
  })

  it('returns 400 when personId is missing', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    const request = new NextRequest('http://localhost/api/redis/efecte-persons')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('personId parameter is required')
  })

  it('returns persons when found', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    const mockPersons = [{ id: '1', name: 'Test Person', attributes: [] }]
    vi.mocked(getRedisKey).mockResolvedValue(JSON.stringify(mockPersons))

    const request = new NextRequest(
      'http://localhost/api/redis/efecte-persons?personId=test-id'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.persons).toEqual(mockPersons)
  })

  it('returns 404 when persons not found', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/redis/efecte-persons?personId=test-id'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error).toBe('Persons not found')
  })

  it('returns 500 on Redis error', async () => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockRejectedValue(new Error('Redis error'))

    const request = new NextRequest(
      'http://localhost/api/redis/efecte-persons?personId=test-id'
    )
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
  })
})
