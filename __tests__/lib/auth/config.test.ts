import { describe, it, expect } from 'vitest'

describe('NextAuth Config', () => {
  it('exports authOptions', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions).toBeDefined()
    expect(authOptions.providers).toBeDefined()
    expect(authOptions.session).toBeDefined()
  })

  it('has CredentialsProvider configured', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions.providers).toHaveLength(1)
    expect(authOptions.providers[0].type).toBe('credentials')
  })

  it('uses JWT session strategy', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions.session?.strategy).toBe('jwt')
    expect(authOptions.session?.maxAge).toBe(8 * 60 * 60)
  })

  it('has jwt callback configured', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions.callbacks?.jwt).toBeDefined()
    expect(typeof authOptions.callbacks?.jwt).toBe('function')
  })

  it('has session callback configured', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions.callbacks?.session).toBeDefined()
    expect(typeof authOptions.callbacks?.session).toBe('function')
  })

  it('jwt callback adds user info to token', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    const jwtCallback = authOptions.callbacks?.jwt

    if (!jwtCallback) {
      throw new Error('JWT callback not defined')
    }

    const mockUser = {
      id: '1',
      username: 'testuser',
      role: 'admin' as const,
    }

    const result = await jwtCallback({
      token: { username: '', role: 'admin' as const },
      user: mockUser,
      trigger: 'signIn' as any,
      session: undefined as any,
      account: null,
    })

    expect(result.username).toBe('testuser')
    expect(result.role).toBe('admin')
  })

  it('jwt callback preserves existing token when no user', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    const jwtCallback = authOptions.callbacks?.jwt

    if (!jwtCallback) {
      throw new Error('JWT callback not defined')
    }

    const existingToken = {
      username: 'testuser',
      role: 'admin' as const,
    }

    const result = await jwtCallback({
      token: existingToken,
      user: undefined as any,
      trigger: 'update' as any,
      session: undefined as any,
      account: null,
    })

    expect(result).toEqual(existingToken)
  })

  it('session callback adds user info to session', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    const sessionCallback = authOptions.callbacks?.session

    if (!sessionCallback) {
      throw new Error('Session callback not defined')
    }

    const mockToken = {
      username: 'testuser',
      role: 'admin' as const,
    }

    const result = await sessionCallback({
      session: {
        expires: '2025-12-31',
        user: {} as any,
      },
      token: mockToken,
      trigger: 'getSession' as any,
      newSession: undefined as any,
      user: undefined as any,
    })

    if (result.user) {
      expect((result.user as any).username).toBe('testuser')
      expect((result.user as any).role).toBe('admin')
    }
  })

  it('has pages configuration', async () => {
    const { authOptions } = await import('@/lib/auth/config')
    expect(authOptions.pages).toBeDefined()
    expect(authOptions.pages?.signIn).toBe('/login')
  })
})
