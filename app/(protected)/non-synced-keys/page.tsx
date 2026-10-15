'use client'

import { useState } from 'react'
import { useNonSyncedKeys } from '@/hooks/useNonSyncedKeys'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { RealEstateGroup } from '@/types'
import { KeyListView } from '@/components/non-synced-keys/KeyListView'
import { InfoPanel } from '@/components/non-synced-keys/InfoPanel'
import { useI18n } from '@/components/providers/language-provider'
import { formatDateTime } from '@/lib/i18n'

export default function NonSyncedKeysPage() {
  const { data, isLoading, error, refetch } = useNonSyncedKeys()
  const { t, language } = useI18n()
  const [view, setView] = useState<'list' | 'keys'>('list')
  const [selectedRealEstateId, setSelectedRealEstateId] = useState<
    string | null
  >(null)

  // Update selectedRealEstate when data changes
  const selectedRealEstate = selectedRealEstateId
    ? data?.realEstates.find(re => re.realEstateId === selectedRealEstateId) ||
      null
    : null

  // If the selected real estate no longer exists (all keys resolved), go back to list.
  // State is adjusted during rendering instead of an effect to avoid an extra render pass.
  if (view === 'keys' && selectedRealEstateId && data && !selectedRealEstate) {
    setView('list')
    setSelectedRealEstateId(null)
  }

  const handleRefresh = async () => {
    await refetch()
    toast.success(t.nonSyncedKeys.refreshed)
  }

  const handleSelectRealEstate = (realEstate: RealEstateGroup) => {
    setSelectedRealEstateId(realEstate.realEstateId)
    setView('keys')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedRealEstateId(null)
  }

  // Error state (initial load)
  if (error && !data) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 py-12">
            <h1 className="text-2xl font-bold">
              {t.nonSyncedKeys.loadFailedTitle}
            </h1>
            <p className="text-center text-gray-600 max-w-md">
              {t.nonSyncedKeys.loadFailedDescription}
            </p>
            <Button onClick={() => refetch()}>{t.nonSyncedKeys.retry}</Button>
            <p className="text-sm text-gray-500">
              {t.nonSyncedKeys.loadFailedSupport}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show key list view if a real estate is selected
  if (view === 'keys' && selectedRealEstate) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button
            variant="ghost"
            onClick={handleBackToList}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {t.nonSyncedKeys.backToList}
          </Button>
          <KeyListView realEstate={selectedRealEstate} />
        </div>
      </div>
    )
  }

  // Real estate list view
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t.nonSyncedKeys.title}</h1>
          <p className="text-gray-600 mt-2">{t.nonSyncedKeys.subtitle}</p>
        </div>

        <InfoPanel />

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {t.nonSyncedKeys.lastIntegrationRun}{' '}
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-48" />
            ) : data?.lastIntegrationRun ? (
              <span className="font-medium">
                {formatDateTime(data.lastIntegrationRun, language)}
              </span>
            ) : (
              <span className="text-gray-500">
                {t.nonSyncedKeys.unableToLoad}
              </span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            {t.nonSyncedKeys.refresh}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : data?.realEstates && data.realEstates.length > 0 ? (
          <div className="space-y-3">
            {data.realEstates.map(realEstate => (
              <button
                key={realEstate.realEstateId}
                onClick={() => handleSelectRealEstate(realEstate)}
                className="w-full p-4 border rounded-lg text-left hover:bg-accent hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {realEstate.realEstateName}
                  </span>
                  <span className="text-sm text-gray-600">
                    ({t.nonSyncedKeys.keyCount(realEstate.totalKeys)})
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <h2 className="text-xl font-semibold">
              {t.nonSyncedKeys.emptyTitle}
            </h2>
            <p className="text-gray-600">{t.nonSyncedKeys.emptyDescription}</p>
          </div>
        )}
      </div>
    </div>
  )
}
