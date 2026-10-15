import { useState } from 'react'
import { useEfectePersons } from '@/hooks/useEfectePersons'
import {
  useSavePersonMapping,
  getSaveMappingErrorMessage,
} from '@/hooks/useSavePersonMapping'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import type { AuditRecord, EfectePerson } from '@/types'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { useI18n } from '@/components/providers/language-provider'

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
  const { t } = useI18n()
  const { data: persons, isLoading, error } = useEfectePersons(personId)
  const [selectedPerson, setSelectedPerson] = useState<EfectePerson | null>(
    null
  )
  const [showConfirmation, setShowConfirmation] = useState(false)

  const { mutate: saveMapping, isPending } = useSavePersonMapping({
    onSuccess: () => {
      toast.success(t.toasts.matchSaved, { duration: 5000 })
      onSuccess()
    },
    onError: error => {
      toast.error(getSaveMappingErrorMessage(error, t), { duration: 5000 })
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
        <h3 className="font-bold text-lg">{t.matchingPersons.title}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span>{t.common.loading}</span>
        </div>
      </div>
    )
  }

  if (error || !persons || persons.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">{t.matchingPersons.title}</h3>
        <Alert variant="destructive">
          <AlertDescription>{t.matchingPersons.loadFailed}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="font-bold text-lg">{t.matchingPersons.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t.matchingPersons.subtitle}
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
                  <div className="font-semibold">
                    {t.matchingPersons.person(index + 1)}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.fullName}
                      </span>{' '}
                      {getEfecteAttribute(person, 'full_name')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.email}
                      </span>{' '}
                      {getEfecteAttribute(person, 'email')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.mobile}
                      </span>{' '}
                      {getEfecteAttribute(person, 'mobile')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.phone}
                      </span>{' '}
                      {getEfecteAttribute(person, 'phone')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.jobTitle}
                      </span>{' '}
                      {getEfecteAttribute(person, 'title')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.department}
                      </span>{' '}
                      {getEfecteAttribute(person, 'department')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.office}
                      </span>{' '}
                      {getEfecteAttribute(person, 'office')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.efecteId}
                      </span>{' '}
                      {getEfecteAttribute(person, 'efecte_id')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.entityId}
                      </span>{' '}
                      {getEfecteAttribute(person, 'person_entityid')}
                    </div>
                    <div>
                      <span className="font-medium">
                        {t.matchingPersons.status}
                      </span>{' '}
                      {getEfecteAttribute(person, 'status')}
                    </div>
                  </div>

                  {streetAddresses.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">
                        {t.matchingPersons.streetAddresses}
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
                    {t.matchingPersons.select}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {showConfirmation && selectedPerson && (
        <ConfirmationDialog
          title={t.matchingPersons.confirmTitle}
          message={t.matchingPersons.confirmMessage(
            getEfecteAttribute(selectedPerson, 'person_entityid'),
            getEfecteAttribute(selectedPerson, 'efecte_id')
          )}
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
