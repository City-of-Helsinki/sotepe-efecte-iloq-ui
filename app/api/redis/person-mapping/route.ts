import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { setRedisKey, deleteRedisKey } from '@/lib/redis/operations'
import { logger } from '@/lib/logger'
import type { SaveMappingData } from '@/types'

// POST /api/redis/person-mapping
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SaveMappingData = await request.json()
    const { personId, realEstateId, keyId, mapping } = body

    if (!personId || !realEstateId || !keyId || !mapping) {
      return NextResponse.json(
        { error: 'personId, realEstateId, keyId, and mapping are required' },
        { status: 400 }
      )
    }

    // 1. Write mapping to Redis
    const mappingKey = `efecte-iLoq-synchronization-integration:mapped:person:iLoq:${personId}`
    await setRedisKey(mappingKey, JSON.stringify(mapping))

    // 2. Delete audit record
    const auditKey = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:${realEstateId}:${keyId}`
    await deleteRedisKey(auditKey)

    // 3. Delete Efecte persons key (if exists - ignore errors)
    try {
      const personsKey = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:${personId}`
      await deleteRedisKey(personsKey)
    } catch (error) {
      logger.warn({ error, personId }, 'Failed to delete Efecte persons key')
    }

    logger.info(
      { personId, realEstateId, keyId, mapping },
      'Person mapping saved successfully'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/redis/person-mapping')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
