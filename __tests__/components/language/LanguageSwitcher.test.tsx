import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import {
  LanguageProvider,
  useI18n,
} from '@/components/providers/language-provider'
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher'
import { getDictionary, LANGUAGE_COOKIE } from '@/lib/i18n'

function TranslatedText() {
  const { t } = useI18n()
  return <p>{t.nav.nonSyncedKeys}</p>
}

describe('LanguageSwitcher', () => {
  const refresh = vi.fn()

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({ refresh } as any)
    refresh.mockClear()
    document.cookie = `${LANGUAGE_COOKIE}=; path=/; max-age=0`
    document.documentElement.lang = 'fi'
  })

  it('renders in the initial language and marks it as selected', () => {
    render(
      <LanguageProvider initialLanguage="fi">
        <LanguageSwitcher />
        <TranslatedText />
      </LanguageProvider>
    )

    expect(
      screen.getByText(getDictionary('fi').nav.nonSyncedKeys)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'fi' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'en' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('switches the language, stores it in a cookie and refreshes server rendered content', async () => {
    const user = userEvent.setup()

    render(
      <LanguageProvider initialLanguage="fi">
        <LanguageSwitcher />
        <TranslatedText />
      </LanguageProvider>
    )

    await user.click(screen.getByRole('button', { name: 'en' }))

    expect(
      screen.getByText(getDictionary('en').nav.nonSyncedKeys)
    ).toBeInTheDocument()
    expect(document.cookie).toContain(`${LANGUAGE_COOKIE}=en`)
    expect(document.documentElement.lang).toBe('en')
    expect(refresh).toHaveBeenCalledTimes(1)
  })

  it('does nothing when the current language is selected again', async () => {
    const user = userEvent.setup()

    render(
      <LanguageProvider initialLanguage="en">
        <LanguageSwitcher />
      </LanguageProvider>
    )

    await user.click(screen.getByRole('button', { name: 'en' }))

    expect(refresh).not.toHaveBeenCalled()
  })

  it('uses the default language without a provider', () => {
    render(<TranslatedText />)

    expect(
      screen.getByText(getDictionary('fi').nav.nonSyncedKeys)
    ).toBeInTheDocument()
  })
})
