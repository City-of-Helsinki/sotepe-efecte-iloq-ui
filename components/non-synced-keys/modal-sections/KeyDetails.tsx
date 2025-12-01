import type { AuditRecord } from '@/types'

interface KeyDetailsProps {
  keyData: AuditRecord
}

function getKeyStateDescription(state: number): string {
  const descriptions: Record<number, string> = {
    0: 'Key is in planning state',
    1: 'Key is handed over to a person',
    2: "Key is hidden and shouldn't be displayed by default",
    3: 'Key is deleted but remains in the system for logging purposes',
    4: 'Key is returned',
  }
  return descriptions[state] || 'Unknown state'
}

export function KeyDetails({ keyData }: KeyDetailsProps) {
  const { iloqKey } = keyData

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Key Details</h3>
      <div className="space-y-1 text-sm">
        <div>
          <span className="font-medium">Description:</span>{' '}
          {iloqKey.description || '-'}
        </div>
        <div>
          <span className="font-medium">Real Estate:</span>{' '}
          {iloqKey.realEstateName}
        </div>
        <div>
          <span className="font-medium">State:</span> {iloqKey.state} -{' '}
          {getKeyStateDescription(iloqKey.state)}
        </div>
        {iloqKey.securityAccesses && iloqKey.securityAccesses.length > 0 && (
          <div>
            <span className="font-medium">Security Accesses:</span>
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
