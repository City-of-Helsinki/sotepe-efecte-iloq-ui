import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveMappingData } from '@/types'

async function savePersonMapping(data: SaveMappingData): Promise<void> {
  const response = await fetch('/api/redis/person-mapping', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save person mapping')
  }
}

interface UseSavePersonMappingOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function useSavePersonMapping(options?: UseSavePersonMappingOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: savePersonMapping,
    onSuccess: () => {
      // Invalidate the non-synced-keys query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['non-synced-keys'] })
      options?.onSuccess?.()
    },
    onError: (error: Error) => {
      options?.onError?.(error)
    },
  })
}
