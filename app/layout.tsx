import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/query-provider'
import { LanguageProvider } from '@/components/providers/language-provider'
import { Toaster } from '@/components/ui/sonner'
import { getDictionary } from '@/lib/i18n'
import { getLanguage } from '@/lib/i18n/server'

const inter = Inter({ subsets: ['latin'] })

export async function generateMetadata(): Promise<Metadata> {
  const t = getDictionary(await getLanguage())

  return {
    title: t.common.appName,
    description: t.common.appDescription,
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = await getLanguage()

  return (
    <html lang={language}>
      <body className={inter.className}>
        <LanguageProvider initialLanguage={language}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
