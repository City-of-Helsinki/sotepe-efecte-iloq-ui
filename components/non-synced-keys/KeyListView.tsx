'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type {
  RealEstateGroup,
  AuditRecord,
  FailureCategory,
  SyncDirection,
} from '@/types'
import { KeyDetailsModal } from './KeyDetailsModal'

interface KeyListViewProps {
  realEstate: RealEstateGroup
}

function categorizeKey(message: string): FailureCategory {
  if (message.startsWith('Multiple matching key holders found')) {
    return 'multiple_matching'
  }
  return 'no_matching'
}

function getCategoryDisplayText(category: FailureCategory): string {
  if (category === 'multiple_matching') {
    return 'Multiple matching key holders found'
  }
  return 'No matching key holder / outsider found'
}

function getSyncDirection(key: AuditRecord): SyncDirection {
  if (key.from === 'ILOQ' && key.to === 'EFECTE') {
    return 'ILOQ_TO_EFECTE'
  }
  return 'EFECTE_TO_ILOQ'
}

function getDirectionDisplayText(direction: SyncDirection): string {
  if (direction === 'ILOQ_TO_EFECTE') {
    return 'Direction: iLOQ → Efecte'
  }
  return 'Direction: Efecte → iLOQ'
}

export function KeyListView({ realEstate }: KeyListViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  )
  const [selectedKey, setSelectedKey] = useState<AuditRecord | null>(null)
  const [selectedCategory, setSelectedCategory] =
    useState<FailureCategory | null>(null)

  // Group keys by direction and then by category
  const groupedKeys = realEstate.keys.reduce(
    (acc, key) => {
      const direction = getSyncDirection(key)
      const category = categorizeKey(key.message)

      if (!acc[direction]) {
        acc[direction] = {} as Record<FailureCategory, AuditRecord[]>
      }
      if (!acc[direction][category]) {
        acc[direction][category] = []
      }
      acc[direction][category].push(key)
      return acc
    },
    {} as Record<SyncDirection, Record<FailureCategory, AuditRecord[]>>
  )

  const toggleCategory = (
    direction: SyncDirection,
    category: FailureCategory
  ) => {
    const key = `${direction}-${category}`
    const newSet = new Set(expandedCategories)
    if (newSet.has(key)) {
      newSet.delete(key)
    } else {
      newSet.add(key)
    }
    setExpandedCategories(newSet)
  }

  const isCategoryExpanded = (
    direction: SyncDirection,
    category: FailureCategory
  ) => {
    return expandedCategories.has(`${direction}-${category}`)
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
          Real Estate: {realEstate.realEstateName}
        </h2>
      </div>

      {Object.entries(groupedKeys).map(([direction, categories]) => (
        <div key={direction} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">
            {getDirectionDisplayText(direction as SyncDirection)}
          </h3>

          {Object.entries(categories).map(([category, keys]) => {
            const categoryKey = `${direction}-${category}`
            const isExpanded = isCategoryExpanded(
              direction as SyncDirection,
              category as FailureCategory
            )
            const sortedKeys = [...keys].sort((a, b) =>
              a.iloqKey.description.localeCompare(b.iloqKey.description)
            )

            return (
              <div key={categoryKey} className="border rounded-lg">
                <button
                  onClick={() =>
                    toggleCategory(
                      direction as SyncDirection,
                      category as FailureCategory
                    )
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {getCategoryDisplayText(category as FailureCategory)} (
                      {keys.length} keys)
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t divide-y">
                    {sortedKeys.map(key => (
                      <button
                        key={key.id}
                        onClick={() =>
                          handleKeyClick(key, category as FailureCategory)
                        }
                        className="w-full p-3 text-left hover:bg-accent transition-colors"
                      >
                        <span className="text-sm">
                          {key.iloqKey.description} (
                          {key.iloqKey.person.FirstName}{' '}
                          {key.iloqKey.person.LastName})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}

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
