import { getDictionary } from '@/lib/i18n'
import { getLanguage } from '@/lib/i18n/server'

export default async function DashboardPage() {
  const t = getDictionary(await getLanguage())

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>

        <p className="text-gray-600">{t.dashboard.description}</p>
      </div>
    </div>
  )
}
