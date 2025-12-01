import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRedisKey,
  setRedisKey,
  deleteRedisKey,
  getRedisKeysByPattern,
  getRedisKeysWithValues,
} from '@/lib/redis/operations'

// Mock Redis client
vi.mock('@/lib/redis/client', () => ({
  getRedisClient: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    keys: vi.fn(),
    mget: vi.fn(),
  })),
}))

describe('Redis Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRedisKey', () => {
    it('retrieves value for existing key', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockGet = vi.fn().mockResolvedValue('test-value')
      vi.mocked(getRedisClient).mockReturnValue({ get: mockGet } as any)

      const result = await getRedisKey('test-key')

      expect(mockGet).toHaveBeenCalledWith('test-key')
      expect(result).toBe('test-value')
    })

    it('returns null for non-existent key', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockGet = vi.fn().mockResolvedValue(null)
      vi.mocked(getRedisClient).mockReturnValue({ get: mockGet } as any)

      const result = await getRedisKey('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('setRedisKey', () => {
    it('sets key without TTL', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockSet = vi.fn().mockResolvedValue('OK')
      vi.mocked(getRedisClient).mockReturnValue({ set: mockSet } as any)

      await setRedisKey('test-key', 'test-value')

      expect(mockSet).toHaveBeenCalledWith('test-key', 'test-value')
    })

    it('sets key with TTL', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockSetex = vi.fn().mockResolvedValue('OK')
      vi.mocked(getRedisClient).mockReturnValue({ setex: mockSetex } as any)

      await setRedisKey('test-key', 'test-value', 3600)

      expect(mockSetex).toHaveBeenCalledWith('test-key', 3600, 'test-value')
    })
  })

  describe('deleteRedisKey', () => {
    it('deletes existing key', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockDel = vi.fn().mockResolvedValue(1)
      vi.mocked(getRedisClient).mockReturnValue({ del: mockDel } as any)

      await deleteRedisKey('test-key')

      expect(mockDel).toHaveBeenCalledWith('test-key')
    })
  })

  describe('getRedisKeysByPattern', () => {
    it('returns matching keys', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockKeys = vi.fn().mockResolvedValue(['key1', 'key2', 'key3'])
      vi.mocked(getRedisClient).mockReturnValue({ keys: mockKeys } as any)

      const result = await getRedisKeysByPattern('test:*')

      expect(mockKeys).toHaveBeenCalledWith('test:*')
      expect(result).toEqual(['key1', 'key2', 'key3'])
    })

    it('returns empty array when no matches', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockKeys = vi.fn().mockResolvedValue([])
      vi.mocked(getRedisClient).mockReturnValue({ keys: mockKeys } as any)

      const result = await getRedisKeysByPattern('nonexistent:*')

      expect(result).toEqual([])
    })
  })

  describe('getRedisKeysWithValues', () => {
    it('returns keys with their values', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockKeys = vi.fn().mockResolvedValue(['key1', 'key2', 'key3'])
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce('value2')
        .mockResolvedValueOnce('value3')
      vi.mocked(getRedisClient).mockReturnValue({
        keys: mockKeys,
        get: mockGet,
      } as any)

      const result = await getRedisKeysWithValues('test:*')

      expect(mockKeys).toHaveBeenCalledWith('test:*')
      expect(mockGet).toHaveBeenCalledTimes(3)
      expect(result).toEqual([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
        { key: 'key3', value: 'value3' },
      ])
    })

    it('returns empty array when no keys match', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockKeys = vi.fn().mockResolvedValue([])
      const mockGet = vi.fn()
      vi.mocked(getRedisClient).mockReturnValue({
        keys: mockKeys,
        get: mockGet,
      } as any)

      const result = await getRedisKeysWithValues('nonexistent:*')

      expect(result).toEqual([])
      expect(mockGet).not.toHaveBeenCalled()
    })

    it('handles null values from get', async () => {
      const { getRedisClient } = await import('@/lib/redis/client')
      const mockKeys = vi.fn().mockResolvedValue(['key1', 'key2'])
      const mockGet = vi
        .fn()
        .mockResolvedValueOnce('value1')
        .mockResolvedValueOnce(null)
      vi.mocked(getRedisClient).mockReturnValue({
        keys: mockKeys,
        get: mockGet,
      } as any)

      const result = await getRedisKeysWithValues('test:*')

      expect(result).toEqual([
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: '' },
      ])
    })
  })
})
