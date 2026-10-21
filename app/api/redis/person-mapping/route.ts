import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getRedisKey,
  setRedisKey,
  deleteRedisKey,
} from '@/lib/redis/operations'
import { logger } from '@/lib/logger'
import type {
  AuditRecord,
  SaveMappingData,
  SaveMappingErrorCode,
  PersonMapping,
  OutsiderMapping,
} from '@/types'

function errorResponse(
  error: string,
  code: SaveMappingErrorCode,
  status: number
) {
  return NextResponse.json({ error, code }, { status })
}

function isPersonMapping(
  mapping: PersonMapping | OutsiderMapping
): mapping is PersonMapping {
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
      .map(part =>
        part.length > 1 ? part.substring(0, 2) : part.substring(0, 1)
      )
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
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const body: SaveMappingData = await request.json()
    const { personId, realEstateId, keyId, mapping } = body

    if (!personId || !realEstateId || !keyId || !mapping) {
      return errorResponse(
        'personId, realEstateId, keyId, and mapping are required',
        'INVALID_REQUEST',
        400
      )
    }

    // The integration scopes person mappings by iLOQ customer code, which it stores in the audit record
    const auditKey = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:${realEstateId}:${keyId}`
    const auditRecordJson = await getRedisKey(auditKey)
    const customerCode = auditRecordJson
      ? (JSON.parse(auditRecordJson) as AuditRecord).customerCode
      : undefined

    if (!customerCode) {
      logger.warn(
        { personId, realEstateId, keyId },
        'Customer code missing from audit record'
      )
      return errorResponse(
        'Customer code is missing from the audit record. Wait for the next integration run and try again.',
        'CUSTOMER_CODE_MISSING',
        409
      )
    }

    // 1. Write iLoq→Efecte mapping to Redis
    const iLoqMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:iLoq:${customerCode}:${personId}`
    await setRedisKey(iLoqMappingKey, JSON.stringify(mapping))

    // 2. Write Efecte→iLoq mapping to Redis
    // For regular persons: key is entityId, value is iLoq personId
    // For outsiders: key is createIdentifier(email, name), value is iLoq personId
    if (isPersonMapping(mapping)) {
      const efecteMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:efecte:${customerCode}:${mapping.entityId}`
      await setRedisKey(efecteMappingKey, personId)
    } else {
      const outsiderIdentifier = createOutsiderIdentifier(
        mapping.outsiderEmail,
        mapping.outsiderName
      )
      const efecteMappingKey = `efecte-iLoq-synchronization-integration:mapped:person:efecte:${customerCode}:${outsiderIdentifier}`
      await setRedisKey(efecteMappingKey, personId)
    }

    // 3. Delete audit record
    await deleteRedisKey(auditKey)

    // 4. Delete Efecte persons key (if exists - ignore errors)
    try {
      const personsKey = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:${personId}`
      await deleteRedisKey(personsKey)
    } catch (error) {
      logger.warn({ error, personId }, 'Failed to delete Efecte persons key')
    }

    logger.info(
      { personId, realEstateId, keyId, customerCode, mapping },
      'Person mapping saved successfully'
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/redis/person-mapping')
    return errorResponse('Internal server error', 'SAVE_FAILED', 500)
  }
}
