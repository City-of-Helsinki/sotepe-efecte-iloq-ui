import { useQuery } from '@tanstack/react-query'
import type {
  RealEstateGroup,
  AuditRecord,
  NonSyncedKeysResponse,
} from '@/types'
import { isShownInUi } from '@/lib/non-synced-keys/categories'

async function fetchNonSyncedKeys(): Promise<NonSyncedKeysResponse> {
  // Fetch keys
  const keysResponse = await fetch('/api/redis/non-synced-keys')
  if (!keysResponse.ok) {
    throw new Error('Failed to fetch non-synced keys')
  }
  const keysData = await keysResponse.json()

  // Fetch timestamp
  let lastIntegrationRun: Date | null = null
  try {
    const timestampResponse = await fetch('/api/redis/integration-timestamp')
    if (timestampResponse.ok) {
      const timestampData = await timestampResponse.json()
      if (timestampData.timestamp) {
        // Parse timestamp from format: "2025:11:02 14:02:11"
        const parts = timestampData.timestamp.split(' ')
        const dateParts = parts[0].split(':')
        const timeParts = parts[1].split(':')

        // Formatted for the selected language when displayed
        lastIntegrationRun = new Date(
          Number.parseInt(dateParts[0]),
          Number.parseInt(dateParts[1]) - 1,
          Number.parseInt(dateParts[2]),
          Number.parseInt(timeParts[0]),
          Number.parseInt(timeParts[1]),
          Number.parseInt(timeParts[2])
        )
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

      // Hidden records are left out before grouping, so real estate key counts match what is shown
      if (!isShownInUi(record)) {
        return
      }

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
    lastIntegrationRun,
  }
}

export function useNonSyncedKeys() {
  return useQuery({
    queryKey: ['non-synced-keys'],
    queryFn: fetchNonSyncedKeys,
  })
}
