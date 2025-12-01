import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getRedisKey } from '@/lib/redis/operations'
import { logger } from '@/lib/logger'

// GET /api/redis/integration-timestamp
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const key = 'efecte-iLoq-synchronization-integration:previousSyncEndedAt'
    const timestamp = await getRedisKey(key)

    if (!timestamp) {
      logger.warn('Integration timestamp not found in Redis')
      return NextResponse.json({ timestamp: null })
    }

    logger.info({ timestamp }, 'Fetched integration timestamp')

    return NextResponse.json({ timestamp })
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/redis/integration-timestamp')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
