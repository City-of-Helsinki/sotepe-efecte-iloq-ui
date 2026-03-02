import { useQuery } from '@tanstack/react-query'
import type { RealEstateGroup, AuditRecord } from '@/types'

interface NonSyncedKeysData {
  realEstates: RealEstateGroup[]
  lastIntegrationRun: string | null
}

async function fetchNonSyncedKeys(): Promise<NonSyncedKeysData> {
  // Fetch keys
  const keysResponse = await fetch('/api/redis/non-synced-keys')
  if (!keysResponse.ok) {
    throw new Error('Failed to fetch non-synced keys')
  }
  const keysData = await keysResponse.json()

  // Fetch timestamp
  let formattedTimestamp: string | null = null
  try {
    const timestampResponse = await fetch('/api/redis/integration-timestamp')
    if (timestampResponse.ok) {
      const timestampData = await timestampResponse.json()
      if (timestampData.timestamp) {
        // Parse timestamp from format: "2025:11:02 14:02:11"
        const parts = timestampData.timestamp.split(' ')
        const dateParts = parts[0].split(':')
        const timeParts = parts[1].split(':')

        const date = new Date(
          Number.parseInt(dateParts[0]),
          Number.parseInt(dateParts[1]) - 1,
          Number.parseInt(dateParts[2]),
          Number.parseInt(timeParts[0]),
          Number.parseInt(timeParts[1]),
          Number.parseInt(timeParts[2])
        )

        // Format as "Month Day, Year at HH:MM"
        formattedTimestamp = date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
        formattedTimestamp += ` at ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
      }
    }
  } catch (error) {
    console.error('Failed to fetch integration timestamp:', error)
  }

  // Parse and group keys
  const realEstatesMap = new Map<string, RealEstateGroup>()

  keysData.keys.forEach(({ key, value }: { key: string; value: string }) => {
    try {
      const record: AuditRecord = JSON.parse(value)
      const { realEstateId, realEstateName } = record.iloqKey

      if (!realEstatesMap.has(realEstateId)) {
        realEstatesMap.set(realEstateId, {
          realEstateId,
          realEstateName,
          totalKeys: 0,
          keys: [],
        })
      }

      const group = realEstatesMap.get(realEstateId)!
      group.keys.push(record)
      group.totalKeys++
    } catch (error) {
      console.error('Failed to parse audit record:', error)
    }
  })

  // Sort real estates alphabetically by name
  const realEstates = Array.from(realEstatesMap.values()).sort((a, b) =>
    a.realEstateName.localeCompare(b.realEstateName)
  )

  return {
    realEstates,
    lastIntegrationRun: formattedTimestamp,
  }
}

export function useNonSyncedKeys() {
  return useQuery({
    queryKey: ['non-synced-keys'],
    queryFn: fetchNonSyncedKeys,
  })
}
