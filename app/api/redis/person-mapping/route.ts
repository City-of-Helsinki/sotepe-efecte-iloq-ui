import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { setRedisKey, deleteRedisKey } from '@/lib/redis/operations'
import { logger } from '@/lib/logger'
import type { SaveMappingData, PersonMapping, OutsiderMapping } from '@/types'

function isPersonMapping(mapping: PersonMapping | OutsiderMapping): mapping is PersonMapping {
  return 'entityId' in mapping
}

/**
 * Creates an outsider identifier matching the backend's Helper.createIdentifier logic.
 * Format: email#INITIALS (two letters per name part, falling back to shorter forms if > 50 chars)
 */
function createOutsiderIdentifier(email: string, name: string): string {
  const MAX_LENGTH = 50
  const emailPart = email.trim().toLowerCase()

  const createWithTwoLetters = (emailStr: string, nameStr: string): string => {
    const nameParts = nameStr.trim().split(/\s+/)
    const namePrefix = nameParts
      .filter(part => part.length > 0)
      .map(part => (part.length > 1 ? part.substring(0, 2) : part.substring(0, 1)))
      .join('')
    return emailStr + '#' + namePrefix.toUpperCase()
  }

  const createWithOneLetter = (emailStr: string, nameStr: string): string => {
    const nameParts = nameStr.trim().split(/\s+/)
    const namePrefix = nameParts
      .filter(part => part.length > 0)
      .map(part => part.substring(0, 1))
      .join('')
    return emailStr + '#' + namePrefix.toUpperCase()
  }

  let identifier = createWithTwoLetters(emailPart, name)

  if (identifier.length > MAX_LENGTH) {
    identifier = createWithOneLetter(emailPart, name)

    if (identifier.length > MAX_LENGTH) {
      const username = emailPart.split('@')[0]
      identifier = createWithOneLetter(username, name)
    }
  }

  return identifier
}

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

    // 1. Write iLoq→Efecte mapping to Redis
    const iLoqMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:iLoq:${personId}`
    await setRedisKey(iLoqMappingKey, JSON.stringify(mapping))

    // 2. Write Efecte→iLoq mapping to Redis
    // For regular persons: key is entityId, value is iLoq personId
    // For outsiders: key is createIdentifier(email, name), value is iLoq personId
    if (isPersonMapping(mapping)) {
      const efecteMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:efecte:${mapping.entityId}`
      await setRedisKey(efecteMappingKey, personId)
    } else {
      const outsiderIdentifier = createOutsiderIdentifier(mapping.outsiderEmail, mapping.outsiderName)
      const efecteMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:efecte:${outsiderIdentifier}`
      await setRedisKey(efecteMappingKey, personId)
    }

    // 3. Delete audit record
    const auditKey = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:${realEstateId}:${keyId}`
    await deleteRedisKey(auditKey)

    // 4. Delete Efecte persons key (if exists - ignore errors)
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
