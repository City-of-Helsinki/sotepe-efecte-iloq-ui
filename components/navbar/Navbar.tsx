'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-foreground"
            >
              Efecte-iLOQ Integration
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
                Dashboard
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
                Non-Synced Keys
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
