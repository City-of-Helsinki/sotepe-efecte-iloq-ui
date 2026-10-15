export const LANGUAGES = ['fi', 'en'] as const

export type Language = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'fi'

export const LANGUAGE_COOKIE = 'lang'

// One year, the language choice is a long lived user preference
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && LANGUAGES.includes(value as Language)
}

export function resolveLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE
}
