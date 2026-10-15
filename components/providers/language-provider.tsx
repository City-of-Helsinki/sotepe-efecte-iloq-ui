'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  getDictionary,
  type Dictionary,
  type Language,
} from '@/lib/i18n'

interface LanguageContextValue {
  language: Language
  t: Dictionary
  setLanguage: (language: Language) => void
}

// Without a provider (e.g. in isolated component tests) the default language is used
const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  t: getDictionary(DEFAULT_LANGUAGE),
  setLanguage: () => {},
})

interface LanguageProviderProps {
  initialLanguage: Language
  children: React.ReactNode
}

export function LanguageProvider({
  initialLanguage,
  children,
}: LanguageProviderProps) {
  const router = useRouter()
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      // The cookie is read on the server, so server rendered parts also use the chosen language
      document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`
      document.documentElement.lang = nextLanguage
      setLanguageState(nextLanguage)
      router.refresh()
    },
    [router]
  )

  const value = useMemo(
    () => ({ language, t: getDictionary(language), setLanguage }),
    [language, setLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useI18n(): LanguageContextValue {
  return useContext(LanguageContext)
}
