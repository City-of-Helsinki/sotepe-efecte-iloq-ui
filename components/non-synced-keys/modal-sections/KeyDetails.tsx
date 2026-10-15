'use client'

import type { AuditRecord } from '@/types'
import { useI18n } from '@/components/providers/language-provider'

interface KeyDetailsProps {
  keyData: AuditRecord
}

export function KeyDetails({ keyData }: KeyDetailsProps) {
  const { t } = useI18n()
  const { iloqKey } = keyData

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">{t.keyDetails.title}</h3>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium">{t.keyDetails.description}</span>{' '}
          {iloqKey.description || '-'}
        </div>
        <div>
          <span className="font-medium">{t.keyDetails.realEstate}</span>{' '}
          {iloqKey.realEstateName}
        </div>
        <div>
          <span className="font-medium">{t.keyDetails.state}</span>{' '}
          {iloqKey.state} -{' '}
          {t.keyDetails.states[iloqKey.state] ?? t.keyDetails.unknownState}
        </div>
        {iloqKey.securityAccesses && iloqKey.securityAccesses.length > 0 && (
          <div>
            <span className="font-medium">{t.keyDetails.securityAccesses}</span>
            <ul className="list-disc list-inside ml-4 mt-1">
              {iloqKey.securityAccesses.map((access, index) => (
                <li key={index}>{access.Name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
