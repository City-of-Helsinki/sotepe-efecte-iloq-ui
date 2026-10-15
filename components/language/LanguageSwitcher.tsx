'use client'

import { useI18n } from '@/components/providers/language-provider'
import { LANGUAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, t, setLanguage } = useI18n()

  return (
    <div
      role="group"
      aria-label={t.languageSwitcher.label}
      className={cn('flex items-center rounded-md border text-sm', className)}
    >
      {LANGUAGES.map(option => (
        <button
          key={option}
          type="button"
          lang={option}
          aria-pressed={language === option}
          title={t.languageSwitcher[option]}
          onClick={() => {
            if (option !== language) setLanguage(option)
          }}
          className={cn(
            'px-2 py-1 font-medium uppercase transition-colors first:rounded-l-md last:rounded-r-md',
            language === option
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
