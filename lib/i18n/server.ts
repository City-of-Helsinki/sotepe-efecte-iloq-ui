import { cookies } from 'next/headers'
import { LANGUAGE_COOKIE, resolveLanguage, type Language } from './config'

// Reads the language chosen by the user before rendering, so the page is rendered in the right language
export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies()

  return resolveLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value)
}
