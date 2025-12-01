import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import {
  getRedisKey,
  setRedisKey,
  deleteRedisKey,
  getRedisKeysByPattern,
  getRedisKeysWithValues,
} from '@/lib/redis/operations'
import { logger } from '@/lib/logger'

// GET /api/redis/keys?key=<key> or ?pattern=<pattern>&withValues=true
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')
    const pattern = searchParams.get('pattern')
    const withValues = searchParams.get('withValues') === 'true'

    // Get single key
    if (key) {
      const value = await getRedisKey(key)
      if (value === null) {
        return NextResponse.json({ error: 'Key not found' }, { status: 404 })
      }
      return NextResponse.json({ key, value })
    }

    // Get keys by pattern
    if (pattern) {
      if (withValues) {
        const results = await getRedisKeysWithValues(pattern)
        return NextResponse.json({ results })
      } else {
        const keys = await getRedisKeysByPattern(pattern)
        return NextResponse.json({ keys })
      }
    }

    return NextResponse.json(
      { error: 'Either key or pattern parameter is required' },
      { status: 400 }
    )
  } catch (error) {
    logger.error({ error }, 'Error in GET /api/redis/keys')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/redis/keys
// Body: { key: string, value: string, ttl?: number }
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, ttl } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'key and value are required' },
        { status: 400 }
      )
    }

    await setRedisKey(key, value, ttl)
    return NextResponse.json({ success: true, key })
  } catch (error) {
    logger.error({ error }, 'Error in POST /api/redis/keys')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/redis/keys?key=<key>
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'key parameter is required' },
        { status: 400 }
      )
    }

    await deleteRedisKey(key)
    return NextResponse.json({ success: true, key })
  } catch (error) {
    logger.error({ error }, 'Error in DELETE /api/redis/keys')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
