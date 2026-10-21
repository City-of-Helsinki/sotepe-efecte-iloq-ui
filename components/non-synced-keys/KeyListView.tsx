'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { RealEstateGroup, AuditRecord, FailureCategory } from '@/types'
import {
  FAILURE_CATEGORIES,
  categorizeAuditMessage,
} from '@/lib/non-synced-keys/categories'
import { useI18n } from '@/components/providers/language-provider'
import { KeyDetailsModal } from './KeyDetailsModal'
import { CategoryGuidance } from './CategoryGuidance'

interface KeyListViewProps {
  realEstate: RealEstateGroup
}

// The person name is left out when the audit record has no person details
function formatKeyLabel(key: AuditRecord): string {
  const { FirstName, LastName } = key.iloqKey.person
  const name = [FirstName, LastName].filter(Boolean).join(' ').trim()

  return name ? `${key.iloqKey.description} (${name})` : key.iloqKey.description
}

export function KeyListView({ realEstate }: KeyListViewProps) {
  const { t } = useI18n()
  const [expandedCategories, setExpandedCategories] = useState<
    Set<FailureCategory>
  >(new Set())
  const [selectedKey, setSelectedKey] = useState<AuditRecord | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<FailureCategory | null>(null)

  // Group keys by category, records without a category are not shown in the UI
  const groupedKeys = realEstate.keys.reduce(
    (acc, key) => {
      const category = categorizeAuditMessage(key.message)

      if (category) {
        acc[category] = [...(acc[category] ?? []), key]
      }
      return acc
    },
    {} as Partial<Record<FailureCategory, AuditRecord[]>>
  )

  const toggleCategory = (category: FailureCategory) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(category)) {
      newSet.delete(category)
    } else {
      newSet.add(category)
    }
    setExpandedCategories(newSet)
  }

  const handleKeyClick = (key: AuditRecord, category: FailureCategory) => {
    setSelectedKey(key)
    setSelectedCategory(category)
  }

  const handleModalClose = () => {
    setSelectedKey(null)
    setSelectedCategory(null)
  }

  const handleModalSuccess = () => {
    // Key will be removed via query invalidation
    setSelectedKey(null)
    setSelectedCategory(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {t.nonSyncedKeys.realEstate(realEstate.realEstateName)}
        </h2>
      </div>

      <div className="space-y-4">
        {FAILURE_CATEGORIES.map(category => {
          const keys = groupedKeys[category]

          if (!keys || keys.length === 0) {
            return null
          }

          const isExpanded = expandedCategories.has(category)
          const sortedKeys = [...keys].sort((a, b) =>
            a.iloqKey.description.localeCompare(b.iloqKey.description)
          )

          return (
            <div key={category} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(category)}
                aria-expanded={isExpanded}
                className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {t.categories[category].title} (
                    {t.nonSyncedKeys.keyCount(keys.length)})
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t">
                  <div className="p-3 border-b">
                    <CategoryGuidance category={category} />
                  </div>
                  <div className="divide-y">
                    {sortedKeys.map(key => (
                      <button
                        key={key.id}
                        onClick={() => handleKeyClick(key, category)}
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                      >
                        <span className="text-sm">{formatKeyLabel(key)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedKey && selectedCategory && (
        <KeyDetailsModal
          keyData={selectedKey}
          failureCategory={selectedCategory}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  )
}
