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

const KEY_PREFIX = 'efecte-iLoq-synchronization-integration'

function getAuditRecordKey(realEstateId: string, keyId: string) {
  return `${KEY_PREFIX}:auditRecord:iLoq:key:${realEstateId}:${keyId}`
}

function getILoqMappingKey(customerCode: string, personId: string) {
  return `${KEY_PREFIX}:mapped:person:iLoq:${customerCode}:${personId}`
}

// For regular persons the key is the entity id, for outsiders createIdentifier(email, name)
function getEfecteMappingKey(
  customerCode: string,
  mapping: PersonMapping | OutsiderMapping
) {
  const identifier = isPersonMapping(mapping)
    ? mapping.entityId
    : createOutsiderIdentifier(mapping.outsiderEmail, mapping.outsiderName)

  return `${KEY_PREFIX}:mapped:person:efecte:${customerCode}:${identifier}`
}

// The integration scopes person mappings by iLOQ customer code, which it stores in the audit record
async function getCustomerCode(
  realEstateId: string,
  keyId: string
): Promise<string | undefined> {
  const auditRecordJson = await getRedisKey(
    getAuditRecordKey(realEstateId, keyId)
  )

  return auditRecordJson
    ? (JSON.parse(auditRecordJson) as AuditRecord).customerCode
    : undefined
}

function isValidMapping(
  value: unknown
): value is PersonMapping | OutsiderMapping {
  if (!value || typeof value !== 'object') return false
  const mapping = value as Record<string, unknown>

  return (
    typeof mapping.entityId === 'string' ||
    (typeof mapping.outsiderName === 'string' &&
      typeof mapping.outsiderEmail === 'string')
  )
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

// GET /api/redis/person-mapping?personId=<id>&realEstateId=<id>&keyId=<id>
// Returns the current person mapping, e.g. the name and email an outsider was registered with
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return errorResponse('Unauthorized', 'UNAUTHORIZED', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const personId = searchParams.get('personId')
    const realEstateId = searchParams.get('realEstateId')
    const keyId = searchParams.get('keyId')

    if (!personId || !realEstateId || !keyId) {
      return errorResponse(
        'personId, realEstateId, and keyId are required',
        'INVALID_REQUEST',
        400
      )
    }

    const customerCode = await getCustomerCode(realEstateId, keyId)

    if (!customerCode) {
      return NextResponse.json({ mapping: null })
    }

    const mappingJson = await getRedisKey(
      getILoqMappingKey(customerCode, personId)
    )

    return NextResponse.json({
      mapping: mappingJson ? JSON.parse(mappingJson) : null,
    })
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/redis/person-mapping')
    return errorResponse('Internal server error', 'SAVE_FAILED', 500)
  }
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

    const customerCode = await getCustomerCode(realEstateId, keyId)

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

    const iLoqMappingKey = getILoqMappingKey(customerCode, personId)
    const efecteMappingKey = getEfecteMappingKey(customerCode, mapping)

    // 1. Remove the Efecte→iLoq mapping of a replaced mapping (e.g. corrected outsider details),
    // so the old identifier no longer resolves to this iLOQ person
    const previousMappingJson = await getRedisKey(iLoqMappingKey)
    const previousMapping = previousMappingJson
      ? JSON.parse(previousMappingJson)
      : null

    if (isValidMapping(previousMapping)) {
      const previousEfecteMappingKey = getEfecteMappingKey(
        customerCode,
        previousMapping
      )

      if (
        previousEfecteMappingKey !== efecteMappingKey &&
        (await getRedisKey(previousEfecteMappingKey)) === personId
      ) {
        await deleteRedisKey(previousEfecteMappingKey)
      }
    }

    // 2. Write iLoq→Efecte mapping to Redis
    await setRedisKey(iLoqMappingKey, JSON.stringify(mapping))

    // 3. Write Efecte→iLoq mapping to Redis
    await setRedisKey(efecteMappingKey, personId)

    // 4. Delete audit record
    await deleteRedisKey(getAuditRecordKey(realEstateId, keyId))

    // 5. Delete Efecte persons key (if exists - ignore errors)
    try {
      const personsKey = `${KEY_PREFIX}:auditRecord:iLoq:person:${personId}`
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
