import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">
          Efecte-iLOQ Integration Dashboard
        </h1>

        <p className="text-gray-600">
          This is the initial dashboard for the Efecte-iLOQ integration
          management interface. Additional features and functionality might be
          added in future stages.
        </p>
      </div>
    </div>
  )
}
