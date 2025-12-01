import { useState, useEffect } from 'react'
import { useSavePersonMapping } from '@/hooks/useSavePersonMapping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { AuditRecord, FailureCategory } from '@/types'
import { ConfirmationDialog } from '../ConfirmationDialog'

interface ManualEntryFormsProps {
  keyData: AuditRecord
  failureCategory: FailureCategory
  onSuccess: () => void
  onFormChange: (hasChanges: boolean) => void
}

export function ManualEntryForms({
  keyData,
  failureCategory,
  onSuccess,
  onFormChange,
}: ManualEntryFormsProps) {
  const [formType, setFormType] = useState<'match' | 'outsider' | null>(
    failureCategory === 'no_matching' ? 'match' : null
  )
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)

  // Match form
  const [entityId, setEntityId] = useState('')
  const [efecteId, setEfecteId] = useState('')

  // Outsider form
  const [outsiderName, setOutsiderName] = useState('')
  const [outsiderEmail, setOutsiderEmail] = useState('')

  const { mutate: saveMapping, isPending } = useSavePersonMapping({
    onSuccess: () => {
      const message =
        formType === 'outsider'
          ? 'Person successfully registered as outsider. The key will be synchronized in the next integration run.'
          : 'Person successfully matched. The key will be synchronized in the next integration run.'
      toast.success(message, { duration: 5000 })
      onSuccess()
    },
    onError: error => {
      toast.error(
        `Failed to save the mapping. ${error.message}. Please try again or contact support if the problem persists.`,
        { duration: 5000 }
      )
    },
  })

  // Track form changes
  useEffect(() => {
    const hasChanges =
      formType === 'match'
        ? entityId.length > 0 || efecteId.length > 0
        : formType === 'outsider'
          ? outsiderName.length > 0 || outsiderEmail.length > 0
          : false
    onFormChange(hasChanges)
  }, [formType, entityId, efecteId, outsiderName, outsiderEmail, onFormChange])

  // Validation
  const isEntityIdValid = entityId.length >= 6 && /^\d+$/.test(entityId)
  const isEfecteIdValid = /^PER-\d{8}$/.test(efecteId)
  const isMatchFormValid = isEntityIdValid && isEfecteIdValid

  const isEmailValid =
    outsiderEmail.includes('@') && outsiderEmail.includes('.')
  const isOutsiderFormValid = outsiderName.trim().length > 0 && isEmailValid

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMatchFormValid) return

    setConfirmationData({
      type: 'match',
      entityId,
      efecteId,
    })
    setShowConfirmation(true)
  }

  const handleOutsiderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOutsiderFormValid) return

    setConfirmationData({
      type: 'outsider',
      name: outsiderName,
      email: outsiderEmail,
    })
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    if (!confirmationData) return

    const mapping =
      confirmationData.type === 'match'
        ? {
            entityId: confirmationData.entityId,
            efecteId: confirmationData.efecteId,
          }
        : {
            outsiderName: confirmationData.name,
            outsiderEmail: confirmationData.email,
          }

    saveMapping({
      personId: keyData.iloqKey.person.Person_ID,
      realEstateId: keyData.iloqKey.realEstateId,
      keyId: keyData.iloqKey.fnKeyId,
      mapping,
    })
  }

  const getConfirmationMessage = () => {
    if (!confirmationData) return ''

    if (confirmationData.type === 'match') {
      return `Are you sure you want to match this person?\n\nEntity ID: ${confirmationData.entityId}\nEfecte ID: ${confirmationData.efecteId}`
    } else {
      return `Are you sure you want to register this person as an outsider?\n\nName: ${confirmationData.name}\nEmail: ${confirmationData.email}`
    }
  }

  return (
    <>
      <div className="space-y-4">
        <RadioGroup
          value={formType || ''}
          onValueChange={value => setFormType(value as 'match' | 'outsider')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="match" id="match" />
            <Label htmlFor="match">Match with Efecte Person</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="outsider" id="outsider" />
            <Label htmlFor="outsider">Register as Outsider</Label>
          </div>
        </RadioGroup>

        {formType === 'match' && (
          <form onSubmit={handleMatchSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="entityId">Entity ID</Label>
              <Input
                id="entityId"
                type="text"
                placeholder="e.g., 392450"
                value={entityId}
                onChange={e => setEntityId(e.target.value)}
                className={
                  entityId && !isEntityIdValid ? 'border-destructive' : ''
                }
              />
              {entityId && !isEntityIdValid && (
                <p className="text-sm text-destructive">
                  Entity ID must contain only numbers (minimum 6 digits)
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="efecteId">Efecte ID</Label>
              <Input
                id="efecteId"
                type="text"
                placeholder="e.g., PER-00028166"
                value={efecteId}
                onChange={e => setEfecteId(e.target.value)}
                className={
                  efecteId && !isEfecteIdValid ? 'border-destructive' : ''
                }
              />
              {efecteId && !isEfecteIdValid && (
                <p className="text-sm text-destructive">
                  Efecte ID must be in format PER-XXXXXXXX (8 digits)
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isMatchFormValid || isPending}>
              Match Person
            </Button>
          </form>
        )}

        {formType === 'outsider' && (
          <form onSubmit={handleOutsiderSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> Please ensure the name exactly matches
                the outsider person name on the Efecte key card.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="outsiderName">Name</Label>
              <Input
                id="outsiderName"
                type="text"
                placeholder="Enter full name"
                value={outsiderName}
                onChange={e => setOutsiderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outsiderEmail">Email</Label>
              <Input
                id="outsiderEmail"
                type="text"
                placeholder="Enter email address"
                value={outsiderEmail}
                onChange={e => setOutsiderEmail(e.target.value)}
                className={
                  outsiderEmail && !isEmailValid ? 'border-destructive' : ''
                }
              />
              {outsiderEmail && !isEmailValid && (
                <p className="text-sm text-destructive">
                  Please enter a valid email address
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isOutsiderFormValid || isPending}>
              Register Outsider
            </Button>
          </form>
        )}
      </div>

      {showConfirmation && (
        <ConfirmationDialog
          title={
            confirmationData?.type === 'match'
              ? 'Confirm Person Matching'
              : 'Confirm Outsider Registration'
          }
          message={getConfirmationMessage()}
          onConfirm={handleConfirm}
          onCancel={() => {
            setShowConfirmation(false)
            setConfirmationData(null)
          }}
          isLoading={isPending}
        />
      )}
    </>
  )
}
