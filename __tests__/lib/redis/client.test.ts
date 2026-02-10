import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getRedisClient, closeRedisClient } from '@/lib/redis/client'

// Mock ioredis
vi.mock('ioredis', () => {
  return {
    default: class MockRedis {
      on = vi.fn()
      quit = vi.fn()
      status = 'ready'
      sentinels?: { host: string; port: number }[]
      name?: string
      host?: string
      port?: number
      password?: string
      sentinelPassword?: string

      constructor(config: any) {
        // Store config for verification
        if (config.sentinels) {
          this.sentinels = config.sentinels
          this.name = config.name
          this.sentinelPassword = config.sentinelPassword
        } else {
          this.host = config.host
          this.port = config.port
        }
        this.password = config.password
      }
    },
  }
})

describe('Redis Client', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment and module cache before each test
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(async () => {
    vi.clearAllMocks()
    process.env = originalEnv
    await closeRedisClient()
  })

  describe('Direct Connection Mode', () => {
    beforeEach(() => {
      process.env.REDIS_USE_SENTINEL = 'false'
      process.env.REDIS_HOST = 'test-redis-host'
      process.env.REDIS_PORT = '6380'
    })

    it('creates a direct connection when REDIS_USE_SENTINEL is false', () => {
      const client = getRedisClient()
      expect(client).toBeDefined()
      expect(client.host).toBe('test-redis-host')
      expect(client.port).toBe(6380)
    })

    it('returns the same singleton instance on multiple calls', () => {
      const client1 = getRedisClient()
      const client2 = getRedisClient()

      expect(client1).toBe(client2)
    })
  })

  describe('Sentinel Mode', () => {
    beforeEach(() => {
      process.env.REDIS_USE_SENTINEL = 'true'
      process.env.REDIS_SENTINEL_HOST = 'test-sentinel-host'
      process.env.REDIS_SENTINEL_PORT = '26380'
      process.env.REDIS_SENTINEL_MASTER = 'test-master'
      process.env.REDIS_PASSWORD = 'test-password'
      process.env.REDIS_SENTINEL_PASSWORD = 'sentinel-password'
    })

    it('creates a sentinel connection when REDIS_USE_SENTINEL is true', () => {
      const client = getRedisClient()
      expect(client).toBeDefined()
      expect(client.sentinels).toBeDefined()
      expect(client.sentinels?.[0].host).toBe('test-sentinel-host')
      expect(client.sentinels?.[0].port).toBe(26380)
      expect(client.name).toBe('test-master')
    })

    it('sets both Redis and Sentinel passwords', () => {
      const client = getRedisClient()
      expect(client.password).toBe('test-password')
      expect(client.sentinelPassword).toBe('sentinel-password')
    })
  })

  describe('Common Client Features', () => {
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
})
