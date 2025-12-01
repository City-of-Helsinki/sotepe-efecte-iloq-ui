import { describe, it, expect } from 'vitest'
import { logger } from '@/lib/logger'

describe('Logger', () => {
  it('exports logger instance', () => {
    expect(logger).toBeDefined()
  })

  it('has info method', () => {
    expect(logger.info).toBeDefined()
    expect(typeof logger.info).toBe('function')
  })

  it('has error method', () => {
    expect(logger.error).toBeDefined()
    expect(typeof logger.error).toBe('function')
  })

  it('has warn method', () => {
    expect(logger.warn).toBeDefined()
    expect(typeof logger.warn).toBe('function')
  })

  it('has debug method', () => {
    expect(logger.debug).toBeDefined()
    expect(typeof logger.debug).toBe('function')
  })

  it('can log info messages', () => {
    expect(() => {
      logger.info({ test: 'data' }, 'Test message')
    }).not.toThrow()
  })

  it('can log error messages', () => {
    expect(() => {
      logger.error({ error: new Error('test') }, 'Error message')
    }).not.toThrow()
  })

  it('can log warn messages', () => {
    expect(() => {
      logger.warn({ warning: 'test' }, 'Warning message')
    }).not.toThrow()
  })

  it('can log debug messages', () => {
    expect(() => {
      logger.debug({ debug: 'test' }, 'Debug message')
    }).not.toThrow()
  })
})
