import Redis from 'ioredis'
import { logger } from '../logger'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const useSentinel = process.env.REDIS_USE_SENTINEL === 'true'

    if (useSentinel) {
      // SENTINEL MODE - configure sentinel connection
      const sentinelHost = process.env.REDIS_SENTINEL_HOST || 'localhost'
      const sentinelPort = Number.parseInt(
        process.env.REDIS_SENTINEL_PORT || '26379',
        10
      )
      const sentinelMaster = process.env.REDIS_SENTINEL_MASTER || 'mymaster'
      const redisPassword = process.env.REDIS_PASSWORD
      const sentinelPassword = process.env.REDIS_SENTINEL_PASSWORD
      const db = Number.parseInt(process.env.REDIS_DB || '0', 10)

      logger.info(
        {
          sentinelHost,
          sentinelPort,
          sentinelMaster,
          db,
        },
        'Connecting to Redis via Sentinel'
      )

      redis = new Redis({
        sentinels: [{ host: sentinelHost, port: sentinelPort }],
        name: sentinelMaster,
        password: redisPassword, // Password for Redis master/replica data nodes
        sentinelPassword: sentinelPassword, // Password for Sentinel nodes
        db,
        retryStrategy: times => {
          const delay = Math.min(times * 50, 2000)
          logger.warn({ times, delay }, 'Redis Sentinel connection retry')
          return delay
        },
        maxRetriesPerRequest: 3,
      })
    } else {
      // DIRECT CONNECTION MODE - configure direct redis connection
      const host = process.env.REDIS_HOST || 'localhost'
      const port = Number.parseInt(process.env.REDIS_PORT || '6379', 10)
      const password = process.env.REDIS_PASSWORD
      const db = Number.parseInt(process.env.REDIS_DB || '0', 10)

      logger.info(
        {
          host,
          port,
          db,
        },
        'Connecting to Redis directly'
      )

      redis = new Redis({
        host,
        port,
        password,
        db,
        retryStrategy: times => {
          const delay = Math.min(times * 50, 2000)
          logger.warn({ times, delay }, 'Redis connection retry')
          return delay
        },
        maxRetriesPerRequest: 3,
      })
    }

    redis.on('connect', () => {
      logger.info('Redis client connected')
    })

    redis.on('error', err => {
      logger.error({ err }, 'Redis client error')
    })

    redis.on('close', () => {
      logger.info('Redis connection closed')
    })
  }

  return redis
}

export async function closeRedisClient(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
    logger.info('Redis client closed')
  }
}
