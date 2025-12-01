'use client'

import { useState, useEffect } from 'react'
import { useNonSyncedKeys } from '@/hooks/useNonSyncedKeys'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { RefreshCw, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { RealEstateGroup, AuditRecord } from '@/types'
import { KeyListView } from '@/components/non-synced-keys/KeyListView'

export default function NonSyncedKeysPage() {
  const { data, isLoading, error, refetch } = useNonSyncedKeys()
  const [view, setView] = useState<'list' | 'keys'>('list')
  const [selectedRealEstateId, setSelectedRealEstateId] = useState<string | null>(null)

  // Update selectedRealEstate when data changes
  const selectedRealEstate = selectedRealEstateId
    ? data?.realEstates.find(re => re.realEstateId === selectedRealEstateId) || null
    : null

  // If the selected real estate no longer exists or has no keys, go back to list
  useEffect(() => {
    if (view === 'keys' && selectedRealEstateId && data) {
      const currentRealEstate = data.realEstates.find(
        re => re.realEstateId === selectedRealEstateId
      )
      if (!currentRealEstate) {
        // Real estate no longer exists (all keys resolved), go back to list
        setView('list')
        setSelectedRealEstateId(null)
      }
    }
  }, [data, view, selectedRealEstateId])

  const handleRefresh = async () => {
    await refetch()
    toast.success('Data refreshed successfully')
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
              Failed to Load Non-Synced Keys
            </h1>
            <p className="text-center text-gray-600 max-w-md">
              Unable to retrieve data from the system. This may be due to a
              temporary connection issue.
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
            <p className="text-sm text-gray-500">
              If the problem persists, please contact support.
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
            Back to Real Estate List
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
          <h1 className="text-3xl font-bold">Non-Synced Keys</h1>
          <p className="text-gray-600 mt-2">
            Keys that failed to synchronize in the last integration run.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Last integration run:{' '}
            {isLoading ? (
              <Skeleton className="inline-block h-4 w-48" />
            ) : data?.lastIntegrationRun ? (
              <span className="font-medium">{data.lastIntegrationRun}</span>
            ) : (
              <span className="text-gray-500">Unable to load</span>
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
            Refresh
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
                    ({realEstate.totalKeys})
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-4">
            <h2 className="text-xl font-semibold">No Synchronization Issues</h2>
            <p className="text-gray-600">
              All keys have been successfully synchronized between iLOQ and
              Efecte.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
