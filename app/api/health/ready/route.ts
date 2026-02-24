import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis/client'
import { logger } from '@/lib/logger'

// GET /api/health/ready - Readiness check
// Returns 200 if the application is ready to serve requests (Redis connection is healthy).
// Returns 503 if Redis is unreachable.
// No authentication required - this endpoint is intended for external monitoring.
export async function GET() {
  try {
    const redis = getRedisClient()
    const pong = await redis.ping()

    if (pong !== 'PONG') {
      logger.warn({ pong }, 'Redis ping returned unexpected response')
      return NextResponse.json(
        { status: 'error', redis: 'unexpected response' },
        { status: 503 }
      )
    }

    return NextResponse.json({ status: 'ok', redis: 'connected' })
  } catch (error) {
    logger.error({ error }, 'Health readiness check failed - Redis unreachable')
    return NextResponse.json(
      { status: 'error', redis: 'disconnected' },
      { status: 503 }
    )
  }
}
