import { useQuery } from '@tanstack/react-query'
import type { AuditRecord, OutsiderMapping, PersonMapping } from '@/types'

async function fetchCurrentPersonMapping(
  keyData: AuditRecord
): Promise<PersonMapping | OutsiderMapping | null> {
  const params = new URLSearchParams({
    personId: keyData.iloqKey.person.Person_ID,
    realEstateId: keyData.iloqKey.realEstateId,
    keyId: keyData.iloqKey.fnKeyId,
  })
  const response = await fetch(`/api/redis/person-mapping?${params}`)

  if (!response.ok) {
    throw new Error('Failed to fetch the person mapping')
  }

  const data = await response.json()
  return data.mapping ?? null
}

export function useCurrentPersonMapping(
  keyData: AuditRecord,
  enabled: boolean
) {
  return useQuery({
    queryKey: [
      'person-mapping',
      keyData.iloqKey.realEstateId,
      keyData.iloqKey.fnKeyId,
    ],
    queryFn: () => fetchCurrentPersonMapping(keyData),
    enabled,
  })
}

export function isOutsiderMapping(
  mapping: PersonMapping | OutsiderMapping | null | undefined
): mapping is OutsiderMapping {
  return !!mapping && 'outsiderName' in mapping
}
