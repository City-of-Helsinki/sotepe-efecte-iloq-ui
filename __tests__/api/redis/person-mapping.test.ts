import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '@/app/api/redis/person-mapping/route'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

vi.mock('@/lib/redis/operations', () => ({
  getRedisKey: vi.fn(),
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

const KEY_PREFIX = 'efecte-iLoq-synchronization-integration'

// Redis values by key, other keys return null
async function mockRedisValues(values: Record<string, string>) {
  const { getRedisKey } = await import('@/lib/redis/operations')
  vi.mocked(getRedisKey).mockImplementation(
    async (key: string) => values[key] ?? null
  )
}

describe('POST /api/redis/person-mapping', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { getRedisKey } = await import('@/lib/redis/operations')
    await mockRedisValues({
      [`${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`]: JSON.stringify({
        customerCode: 'CC1',
      }),
    })
    // clearAllMocks keeps implementations, e.g. a rejected Redis write from an earlier test
    const { setRedisKey, deleteRedisKey } = await import(
      '@/lib/redis/operations'
    )
    vi.mocked(setRedisKey).mockResolvedValue()
    vi.mocked(deleteRedisKey).mockResolvedValue()
  })

  it('returns 401 when not authenticated', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({
          personId: 'p1',
          realEstateId: 're1',
          keyId: 'k1',
          mapping: { entityId: '123', efecteId: 'PER-00012345' },
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Unauthorized')
    expect(data.code).toBe('UNAUTHORIZED')
  })

  it('returns 400 when required fields are missing', async () => {
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({ personId: 'p1' }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('required')
    expect(data.code).toBe('INVALID_REQUEST')
  })

  it('saves person mapping successfully', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey, deleteRedisKey } = await import(
      '@/lib/redis/operations'
    )

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockResolvedValue()
    vi.mocked(deleteRedisKey).mockResolvedValue()

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { entityId: '123456', efecteId: 'PER-00012345' },
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(setRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:iLoq:CC1:person-1`,
      JSON.stringify({ entityId: '123456', efecteId: 'PER-00012345' })
    )
    expect(setRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:efecte:CC1:123456`,
      'person-1'
    )
    expect(deleteRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`
    )
    expect(deleteRedisKey).toHaveBeenCalledTimes(2) // audit record + persons key
  })

  it('saves outsider mapping successfully', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey, deleteRedisKey } = await import(
      '@/lib/redis/operations'
    )

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockResolvedValue()
    vi.mocked(deleteRedisKey).mockResolvedValue()

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { outsiderName: 'John Doe', outsiderEmail: 'john@test.com' },
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(setRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:iLoq:CC1:person-1`,
      JSON.stringify({
        outsiderName: 'John Doe',
        outsiderEmail: 'john@test.com',
      })
    )
    expect(setRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:efecte:CC1:john@test.com#JODO`,
      'person-1'
    )
  })

  it.each([
    ['audit record has no customer code', JSON.stringify({ message: 'foo' })],
    ['audit record is missing', null],
  ])('returns 409 and saves nothing when %s', async (_, auditRecord) => {
    const { getServerSession } = await import('next-auth')
    const { getRedisKey, setRedisKey, deleteRedisKey } = await import(
      '@/lib/redis/operations'
    )

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(getRedisKey).mockResolvedValue(auditRecord)

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { entityId: '123456', efecteId: 'PER-00012345' },
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error).toContain('Customer code')
    expect(data.code).toBe('CUSTOMER_CODE_MISSING')
    expect(setRedisKey).not.toHaveBeenCalled()
    expect(deleteRedisKey).not.toHaveBeenCalled()
  })

  it('returns 500 on Redis error', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey } = await import('@/lib/redis/operations')

    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    vi.mocked(setRedisKey).mockRejectedValue(new Error('Redis write failed'))

    const request = new NextRequest(
      'http://localhost/api/redis/person-mapping',
      {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { entityId: '123456', efecteId: 'PER-00012345' },
        }),
      }
    )

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Internal server error')
    expect(data.code).toBe('SAVE_FAILED')
  })

  it('removes the Efecte mapping of corrected outsider details', async () => {
    const { getServerSession } = await import('next-auth')
    const { setRedisKey, deleteRedisKey } = await import(
      '@/lib/redis/operations'
    )
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    await mockRedisValues({
      [`${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`]: JSON.stringify({
        customerCode: 'CC1',
      }),
      [`${KEY_PREFIX}:mapped:person:iLoq:CC1:person-1`]: JSON.stringify({
        outsiderName: 'Umid Usan',
        outsiderEmail: 'aulapalvelut@hel.fi',
      }),
      [`${KEY_PREFIX}:mapped:person:efecte:CC1:aulapalvelut@hel.fi#UMUS`]:
        'person-1',
    })

    const response = await POST(
      new NextRequest('http://localhost/api/redis/person-mapping', {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { outsiderName: 'Umid Usan', outsiderEmail: 'umid@kavi.fi' },
        }),
      })
    )

    expect(response.status).toBe(200)
    expect(deleteRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:efecte:CC1:aulapalvelut@hel.fi#UMUS`
    )
    expect(setRedisKey).toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:efecte:CC1:umid@kavi.fi#UMUS`,
      'person-1'
    )
  })

  it('keeps an old Efecte mapping that points to another iLOQ person', async () => {
    const { getServerSession } = await import('next-auth')
    const { deleteRedisKey } = await import('@/lib/redis/operations')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)

    await mockRedisValues({
      [`${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`]: JSON.stringify({
        customerCode: 'CC1',
      }),
      [`${KEY_PREFIX}:mapped:person:iLoq:CC1:person-1`]: JSON.stringify({
        entityId: '111111',
        efecteId: 'PER-00011111',
      }),
      [`${KEY_PREFIX}:mapped:person:efecte:CC1:111111`]: 'another-person',
    })

    await POST(
      new NextRequest('http://localhost/api/redis/person-mapping', {
        method: 'POST',
        body: JSON.stringify({
          personId: 'person-1',
          realEstateId: 're-1',
          keyId: 'key-1',
          mapping: { entityId: '222222', efecteId: 'PER-00022222' },
        }),
      })
    )

    expect(deleteRedisKey).not.toHaveBeenCalledWith(
      `${KEY_PREFIX}:mapped:person:efecte:CC1:111111`
    )
  })
})

describe('GET /api/redis/person-mapping', () => {
  const url =
    'http://localhost/api/redis/person-mapping?personId=person-1&realEstateId=re-1&keyId=key-1'

  beforeEach(async () => {
    vi.clearAllMocks()
    const { getServerSession } = await import('next-auth')
    vi.mocked(getServerSession).mockResolvedValue({
      user: { name: 'test', role: 'admin', username: 'test' },
    } as any)
  })

  it('returns the current mapping of the person', async () => {
    await mockRedisValues({
      [`${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`]: JSON.stringify({
        customerCode: 'CC1',
      }),
      [`${KEY_PREFIX}:mapped:person:iLoq:CC1:person-1`]: JSON.stringify({
        outsiderName: 'Umid Usan',
        outsiderEmail: 'aulapalvelut@hel.fi',
      }),
    })

    const response = await GET(new NextRequest(url))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mapping).toEqual({
      outsiderName: 'Umid Usan',
      outsiderEmail: 'aulapalvelut@hel.fi',
    })
  })

  it('returns no mapping when the audit record has no customer code', async () => {
    await mockRedisValues({
      [`${KEY_PREFIX}:auditRecord:iLoq:key:re-1:key-1`]: JSON.stringify({}),
    })

    const response = await GET(new NextRequest(url))
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.mapping).toBeNull()
  })

  it('returns 400 when parameters are missing', async () => {
    const response = await GET(
      new NextRequest('http://localhost/api/redis/person-mapping')
    )
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.code).toBe('INVALID_REQUEST')
  })
})
