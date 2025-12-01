import Redis from 'ioredis'
import { logger } from '../logger'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const host = process.env.REDIS_HOST || 'localhost'
    const port = parseInt(process.env.REDIS_PORT || '6379', 10)
    const password = process.env.REDIS_PASSWORD
    const db = parseInt(process.env.REDIS_DB || '0', 10)

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
