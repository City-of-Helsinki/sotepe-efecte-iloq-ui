'use client'

import { useI18n } from '@/components/providers/language-provider'
import type { FailureCategory } from '@/types'

interface CategoryGuidanceProps {
  category: FailureCategory
}

// Explains what the category means and what the user can do about it
export function CategoryGuidance({ category }: CategoryGuidanceProps) {
  const { t } = useI18n()
  const { description, options } = t.categories[category]

  return (
    <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground space-y-2">
      <p>{description}</p>
      {options.length > 0 && (
        <ul className="list-disc list-outside ml-5 space-y-1">
          {options.map(option => (
            <li key={option}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
