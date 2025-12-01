import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { verifyCredentials } from '@/lib/auth/credentials'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

describe('verifyCredentials', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      ADMIN_USERNAME: 'admin',
      ADMIN_PASSWORD: 'admin123',
      SUPPORT_USERNAME: 'support',
      SUPPORT_PASSWORD: 'support123',
    }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('verifies admin credentials successfully', async () => {
    const result = await verifyCredentials('admin', 'admin123')

    expect(result).toEqual({
      id: 'admin',
      username: 'admin',
      role: 'admin',
    })
  })

  it('verifies support credentials successfully', async () => {
    const result = await verifyCredentials('support', 'support123')

    expect(result).toEqual({
      id: 'support',
      username: 'support',
      role: 'support',
    })
  })

  it('returns null for invalid credentials', async () => {
    const result = await verifyCredentials('invalid', 'wrong')

    expect(result).toBeNull()
  })

  it('returns null when environment variables are missing', async () => {
    process.env = {} as any

    const result = await verifyCredentials('admin', 'admin123')

    expect(result).toBeNull()
  })

  it('returns null for wrong password', async () => {
    const result = await verifyCredentials('admin', 'wrongpassword')

    expect(result).toBeNull()
  })

  it('returns null for non-existent user', async () => {
    const result = await verifyCredentials('nonexistent', 'password')

    expect(result).toBeNull()
  })
})
