'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/providers/language-provider'
import { LanguageSwitcher } from '@/components/language/LanguageSwitcher'

export function Navbar() {
  const pathname = usePathname()
  const { t } = useI18n()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-foreground"
            >
              {t.common.appName}
            </Link>
            <div className="flex gap-4">
              <Link
                href="/dashboard"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === '/dashboard'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {t.nav.dashboard}
              </Link>
              <Link
                href="/non-synced-keys"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname?.startsWith('/non-synced-keys')
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {t.nav.nonSyncedKeys}
              </Link>
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  )
}
