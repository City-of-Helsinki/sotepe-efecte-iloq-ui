import { getRedisClient } from './client'
import { logger } from '../logger'

export async function getRedisKey(key: string): Promise<string | null> {
  try {
    const redis = getRedisClient()
    const value = await redis.get(key)
    logger.debug({ key, hasValue: !!value }, 'Redis GET operation')
    return value
  } catch (error) {
    logger.error({ error, key }, 'Error getting Redis key')
    throw error
  }
}

export async function setRedisKey(
  key: string,
  value: string,
  ttl?: number
): Promise<void> {
  try {
    const redis = getRedisClient()
    if (ttl) {
      await redis.setex(key, ttl, value)
    } else {
      await redis.set(key, value)
    }
    logger.info({ key, hasTtl: !!ttl }, 'Redis SET operation')
  } catch (error) {
    logger.error({ error, key }, 'Error setting Redis key')
    throw error
  }
}

export async function deleteRedisKey(key: string): Promise<void> {
  try {
    const redis = getRedisClient()
    await redis.del(key)
    logger.info({ key }, 'Redis DELETE operation')
  } catch (error) {
    logger.error({ error, key }, 'Error deleting Redis key')
    throw error
  }
}

export async function getRedisKeysByPattern(
  pattern: string
): Promise<string[]> {
  try {
    const redis = getRedisClient()
    const keys = await redis.keys(pattern)
    logger.debug({ pattern, count: keys.length }, 'Redis KEYS operation')
    return keys
  } catch (error) {
    logger.error({ error, pattern }, 'Error getting Redis keys by pattern')
    throw error
  }
}

export async function getRedisKeysWithValues(
  pattern: string
): Promise<Array<{ key: string; value: string }>> {
  try {
    const keys = await getRedisKeysByPattern(pattern)
    const redis = getRedisClient()

    const results = await Promise.all(
      keys.map(async key => {
        const value = await redis.get(key)
        return { key, value: value || '' }
      })
    )

    logger.debug(
      { pattern, count: results.length },
      'Retrieved keys with values'
    )
    return results
  } catch (error) {
    logger.error({ error, pattern }, 'Error getting Redis keys with values')
    throw error
  }
}
