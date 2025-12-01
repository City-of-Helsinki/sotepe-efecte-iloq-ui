import { useState } from 'react'
import { useEfectePersons } from '@/hooks/useEfectePersons'
import { useSavePersonMapping } from '@/hooks/useSavePersonMapping'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import type { AuditRecord, EfectePerson } from '@/types'
import { ConfirmationDialog } from '../ConfirmationDialog'

interface MatchingPersonsProps {
  personId: string
  keyData: AuditRecord
  onSuccess: () => void
}

function getEfecteAttribute(person: EfectePerson, code: string): string {
  const attr = person.attributes.find(a => a.code === code)
  return attr?.value || '-'
}

function getEfecteReferences(person: EfectePerson, code: string): string[] {
  const attr = person.attributes.find(a => a.code === code)
  return attr?.references?.map(ref => ref.name) || []
}

export function MatchingPersons({
  personId,
  keyData,
  onSuccess,
}: MatchingPersonsProps) {
  const { data: persons, isLoading, error } = useEfectePersons(personId)
  const [selectedPerson, setSelectedPerson] = useState<EfectePerson | null>(
    null
  )
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { mutate: saveMapping, isPending } = useSavePersonMapping({
    onSuccess: () => {
      toast.success(
        'Person successfully matched. The key will be synchronized in the next integration run.',
        { duration: 5000 }
      )
      onSuccess()
    },
    onError: error => {
      toast.error(
        `Failed to save the mapping. ${error.message}. Please try again or contact support if the problem persists.`,
        { duration: 5000 }
      )
    },
  })

  const handleSelect = (person: EfectePerson) => {
    setSelectedPerson(person)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    if (!selectedPerson) return

    const entityId = getEfecteAttribute(selectedPerson, 'person_entityid')
    const efecteId = getEfecteAttribute(selectedPerson, 'efecte_id')

    saveMapping({
      personId: keyData.iloqKey.person.Person_ID,
      realEstateId: keyData.iloqKey.realEstateId,
      keyId: keyData.iloqKey.fnKeyId,
      mapping: { entityId, efecteId },
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Matching Persons Found in Efecte</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (error || !persons || persons.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Matching Persons Found in Efecte</h3>
        <Alert variant="destructive">
          <AlertDescription>
            Unable to load matching persons from Efecte
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg">
            Matching Persons Found in Efecte
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            (These matches were found based on first name and last name)
          </p>
        </div>

        <div className="space-y-3">
          {persons.map((person, index) => {
            const streetAddresses = getEfecteReferences(
              person,
              'street_address'
            )

            return (
              <Card key={person.id} className="p-4">
                <div className="space-y-2">
                  <div className="font-semibold">Person {index + 1}:</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="font-medium">Full Name:</span>{' '}
                      {getEfecteAttribute(person, 'full_name')}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      {getEfecteAttribute(person, 'email')}
                    </div>
                    <div>
                      <span className="font-medium">Mobile:</span>{' '}
                      {getEfecteAttribute(person, 'mobile')}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{' '}
                      {getEfecteAttribute(person, 'phone')}
                    </div>
                    <div>
                      <span className="font-medium">Title:</span>{' '}
                      {getEfecteAttribute(person, 'title')}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{' '}
                      {getEfecteAttribute(person, 'department')}
                    </div>
                    <div>
                      <span className="font-medium">Office:</span>{' '}
                      {getEfecteAttribute(person, 'office')}
                    </div>
                    <div>
                      <span className="font-medium">Efecte ID:</span>{' '}
                      {getEfecteAttribute(person, 'efecte_id')}
                    </div>
                    <div>
                      <span className="font-medium">Entity ID:</span>{' '}
                      {getEfecteAttribute(person, 'person_entityid')}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{' '}
                      {getEfecteAttribute(person, 'status')}
                    </div>
                  </div>

                  {streetAddresses.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">
                        Street Addresses:
                      </span>
                      <ul className="list-disc list-inside ml-4 text-sm">
                        {streetAddresses.map((addr, i) => (
                          <li key={i}>{addr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSelect(person)}
                    disabled={isPending}
                    className="w-full mt-2"
                  >
                    Select
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {showConfirmation && selectedPerson && (
        <ConfirmationDialog
          title="Confirm Person Matching"
          message={`Are you sure you want to match this person?\n\nEntity ID: ${getEfecteAttribute(selectedPerson, 'person_entityid')}\nEfecte ID: ${getEfecteAttribute(selectedPerson, 'efecte_id')}`}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmation(false)
            setSelectedPerson(null)
          }}
          isLoading={isPending}
        />
      )}
    </>
  )
}
