import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { getRedisKey } from '@/lib/redis/operations'
import { logger } from '@/lib/logger'

// GET /api/redis/efecte-persons?personId=<PERSON_ID>
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const personId = searchParams.get('personId')

    if (!personId) {
      return NextResponse.json(
        { error: 'personId parameter is required' },
        { status: 400 }
      )
    }

    const key = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:${personId}`
    const value = await getRedisKey(key)

    if (!value) {
      logger.warn({ personId }, 'Efecte persons not found for person ID')
      return NextResponse.json({ error: 'Persons not found' }, { status: 404 })
    }

    const persons = JSON.parse(value)
    logger.info({ personId, count: persons.length }, 'Fetched Efecte persons')

    return NextResponse.json({ persons })
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/redis/efecte-persons')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
