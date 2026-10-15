import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { SaveMappingData, SaveMappingErrorCode } from '@/types'
import type { Dictionary } from '@/lib/i18n'

export class SaveMappingError extends Error {
  constructor(
    message: string,
    public readonly code: SaveMappingErrorCode
  ) {
    super(message)
    this.name = 'SaveMappingError'
  }
}

async function savePersonMapping(data: SaveMappingData): Promise<void> {
  const response = await fetch('/api/redis/person-mapping', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new SaveMappingError(
      error.error || 'Failed to save person mapping',
      error.code || 'SAVE_FAILED'
    )
  }
}

// Only the missing customer code has its own message, other failures are shown as a general save failure
export function getSaveMappingErrorMessage(
  error: Error,
  t: Dictionary
): string {
  if (
    error instanceof SaveMappingError &&
    error.code === 'CUSTOMER_CODE_MISSING'
  ) {
    return t.toasts.customerCodeMissing
  }

  return t.toasts.saveFailed
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
