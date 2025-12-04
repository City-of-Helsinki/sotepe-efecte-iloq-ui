import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRedisClient } from '@/lib/redis/client'

// Mock ioredis
vi.mock('ioredis', () => {
  return {
    default: class MockRedis {
      on = vi.fn()
      quit = vi.fn()
      status = 'ready'

      constructor() {
        // Mock constructor
      }
    }
  }
})

describe('Redis Client', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns a Redis client instance', () => {
    const client = getRedisClient()
    expect(client).toBeDefined()
    expect(client).toBeTruthy()
  })

  it('returns the same singleton instance on multiple calls', () => {
    const client1 = getRedisClient()
    const client2 = getRedisClient()

    expect(client1).toBe(client2)
  })

  it('client has on method for event handling', () => {
    const client = getRedisClient()
    expect(client.on).toBeDefined()
    expect(typeof client.on).toBe('function')
  })

  it('client has quit method', () => {
    const client = getRedisClient()
    expect(client.quit).toBeDefined()
    expect(typeof client.quit).toBe('function')
  })

  it('client has ready status', () => {
    const client = getRedisClient()
    expect(client.status).toBe('ready')
  })
})
