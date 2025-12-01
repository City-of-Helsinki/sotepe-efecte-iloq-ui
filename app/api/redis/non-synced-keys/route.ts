import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getRedisKeysWithValues } from '@/lib/redis/operations'
import { logger } from '@/lib/logger'

// GET /api/redis/non-synced-keys
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pattern =
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:*:*'
    const results = await getRedisKeysWithValues(pattern)

    logger.info({ count: results.length }, 'Fetched non-synced keys')

    return NextResponse.json({ keys: results })
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/redis/non-synced-keys')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
