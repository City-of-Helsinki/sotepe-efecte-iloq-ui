import { describe, it, expect } from 'vitest'
import {
  dictionaries,
  formatDateTime,
  isLanguage,
  resolveLanguage,
  DEFAULT_LANGUAGE,
  LANGUAGES,
} from '@/lib/i18n'

// Describes the shape of a dictionary value, so the languages can be compared at runtime as well
function shape(value: unknown): unknown {
  if (typeof value === 'function') return 'function'
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, nested]) => [key, shape(nested)])
    )
  }
  return typeof value
}

describe('i18n', () => {
  it('has the same keys and value types in every language', () => {
    const fiShape = shape(dictionaries.fi)

    LANGUAGES.forEach(language => {
      expect(shape(dictionaries[language])).toEqual(fiShape)
    })
  })

  it('has no empty translations', () => {
    const collect = (value: unknown): string[] =>
      typeof value === 'string'
        ? [value]
        : Array.isArray(value)
          ? value.flatMap(collect)
          : value && typeof value === 'object'
            ? Object.values(value).flatMap(collect)
            : []

    LANGUAGES.forEach(language => {
      collect(dictionaries[language]).forEach(text => {
        expect(text.trim()).not.toBe('')
      })
    })
  })

  it('uses Finnish as the default language', () => {
    expect(DEFAULT_LANGUAGE).toBe('fi')
  })

  it('resolves unknown languages to the default language', () => {
    expect(isLanguage('en')).toBe(true)
    expect(isLanguage('sv')).toBe(false)
    expect(resolveLanguage('en')).toBe('en')
    expect(resolveLanguage('sv')).toBe('fi')
    expect(resolveLanguage(undefined)).toBe('fi')
  })

  it('formats date and time for each language', () => {
    const date = new Date(2026, 9, 15, 9, 5, 0)

    expect(formatDateTime(date, 'fi')).toBe('15.10.2026 klo 9.05')
    expect(formatDateTime(date, 'en')).toBe('October 15, 2026 at 09:05')
  })
})
