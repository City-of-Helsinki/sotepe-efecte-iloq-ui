import { useQuery } from '@tanstack/react-query'
import type { EfectePerson } from '@/types'

async function fetchEfectePersons(personId: string): Promise<EfectePerson[]> {
  const response = await fetch(
    `/api/redis/efecte-persons?personId=${encodeURIComponent(personId)}`
  )

  if (!response.ok) {
    if (response.status === 404) {
      return []
    }
    throw new Error('Failed to fetch Efecte persons')
  }

  const data = await response.json()
  return data.persons || []
}

export function useEfectePersons(personId: string | null) {
  return useQuery({
    queryKey: ['efecte-persons', personId],
    queryFn: () => fetchEfectePersons(personId!),
    enabled: !!personId,
  })
}
