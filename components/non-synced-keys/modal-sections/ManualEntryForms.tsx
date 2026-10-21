import { useState, useEffect } from 'react'
import {
  useSavePersonMapping,
  getSaveMappingErrorMessage,
} from '@/hooks/useSavePersonMapping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import type { AuditRecord, FailureCategory, OutsiderMapping } from '@/types'
import { ConfirmationDialog } from '../ConfirmationDialog'
import { useI18n } from '@/components/providers/language-provider'

interface ManualEntryFormsProps {
  keyData: AuditRecord
  failureCategory: FailureCategory
  onSuccess: () => void
  onFormChange: (hasChanges: boolean) => void
  // The details the person is currently registered as an outsider with, prefilled for correcting them
  initialOutsider?: OutsiderMapping | null
}

type FormType = 'match' | 'outsider'

type ConfirmationData =
  | { type: 'match'; entityId: string; efecteId: string }
  | { type: 'outsider'; name: string; email: string }

function getInitialFormType(category: FailureCategory): FormType | null {
  if (category === 'multiple_matching') return null
  return category === 'outsider_without_key_card' ? 'outsider' : 'match'
}

export function ManualEntryForms({
  keyData,
  failureCategory,
  onSuccess,
  onFormChange,
  initialOutsider,
}: ManualEntryFormsProps) {
  const { t } = useI18n()
  // An outsider without a key card is corrected either by fixing the outsider details or,
  // if the person was registered as an outsider by mistake, by matching with an Efecte person
  const isOutsiderCorrection = failureCategory === 'outsider_without_key_card'
  const initialOutsiderName = initialOutsider?.outsiderName ?? ''
  const initialOutsiderEmail = initialOutsider?.outsiderEmail ?? ''
  const [formType, setFormType] = useState<FormType | null>(
    getInitialFormType(failureCategory)
  )
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] =
    useState<ConfirmationData | null>(null)

  // Match form
  const [entityId, setEntityId] = useState('')
  const [efecteId, setEfecteId] = useState('')

  // Outsider form
  const [outsiderName, setOutsiderName] = useState(initialOutsiderName)
  const [outsiderEmail, setOutsiderEmail] = useState(initialOutsiderEmail)

  const { mutate: saveMapping, isPending } = useSavePersonMapping({
    onSuccess: () => {
      const message =
        formType === 'outsider' ? t.toasts.outsiderSaved : t.toasts.matchSaved
      toast.success(message, { duration: 5000 })
      onSuccess()
    },
    onError: error => {
      toast.error(getSaveMappingErrorMessage(error, t), { duration: 5000 })
    },
  })

  // Validation
  const isEntityIdValid = entityId.length >= 6 && /^\d+$/.test(entityId)
  const isEfecteIdValid = /^PER-\d{8}$/.test(efecteId)
  const isMatchFormValid = isEntityIdValid && isEfecteIdValid

  const isEmailValid =
    outsiderEmail.includes('@') && outsiderEmail.includes('.')
  const isOutsiderChanged =
    outsiderName !== initialOutsiderName ||
    outsiderEmail !== initialOutsiderEmail
  // Saving unchanged outsider details would not correct anything
  const isOutsiderFormValid =
    outsiderName.trim().length > 0 &&
    isEmailValid &&
    (!isOutsiderCorrection || isOutsiderChanged)

  // Track form changes
  useEffect(() => {
    const hasChanges =
      formType === 'match'
        ? entityId.length > 0 || efecteId.length > 0
        : formType === 'outsider'
          ? isOutsiderChanged
          : false
    onFormChange(hasChanges)
  }, [formType, entityId, efecteId, isOutsiderChanged, onFormChange])

  const handleMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isMatchFormValid) return

    setConfirmationData({ type: 'match', entityId, efecteId })
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

    return confirmationData.type === 'match'
      ? t.forms.confirmMatchMessage(
          confirmationData.entityId,
          confirmationData.efecteId
        )
      : t.forms.confirmOutsiderMessage(
          confirmationData.name,
          confirmationData.email
        )
  }

  return (
    <>
      <div className="space-y-4">
        {isOutsiderCorrection ? (
          <RadioGroup
            value={formType || ''}
            onValueChange={value => setFormType(value as FormType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outsider" id="outsider" />
              <Label htmlFor="outsider">{t.forms.correctOutsiderOption}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="match" id="match" />
              <Label htmlFor="match">{t.forms.correctiveMatchOption}</Label>
            </div>
          </RadioGroup>
        ) : (
          <RadioGroup
            value={formType || ''}
            onValueChange={value => setFormType(value as FormType)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="match" id="match" />
              <Label htmlFor="match">{t.forms.matchOption}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outsider" id="outsider" />
              <Label htmlFor="outsider">{t.forms.outsiderOption}</Label>
            </div>
          </RadioGroup>
        )}

        {isOutsiderCorrection && formType === 'match' && (
          <Alert>
            <AlertDescription>{t.forms.correctiveNote}</AlertDescription>
          </Alert>
        )}

        {formType === 'match' && (
          <form onSubmit={handleMatchSubmit} className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.forms.matchNote}</p>

            <div className="space-y-2">
              <Label htmlFor="entityId">{t.forms.entityId}</Label>
              <Input
                id="entityId"
                type="text"
                placeholder={t.forms.entityIdPlaceholder}
                aria-describedby="entityId-help"
                value={entityId}
                onChange={e => setEntityId(e.target.value)}
                className={
                  entityId && !isEntityIdValid ? 'border-destructive' : ''
                }
              />
              <p id="entityId-help" className="text-xs text-muted-foreground">
                {t.forms.entityIdHelp}
              </p>
              {entityId && !isEntityIdValid && (
                <p className="text-sm text-destructive">
                  {t.forms.entityIdInvalid}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="efecteId">{t.forms.efecteId}</Label>
              <Input
                id="efecteId"
                type="text"
                placeholder={t.forms.efecteIdPlaceholder}
                aria-describedby="efecteId-help"
                value={efecteId}
                onChange={e => setEfecteId(e.target.value)}
                className={
                  efecteId && !isEfecteIdValid ? 'border-destructive' : ''
                }
              />
              <p id="efecteId-help" className="text-xs text-muted-foreground">
                {t.forms.efecteIdHelp}
              </p>
              {efecteId && !isEfecteIdValid && (
                <p className="text-sm text-destructive">
                  {t.forms.efecteIdInvalid}
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isMatchFormValid || isPending}>
              {t.forms.matchSubmit}
            </Button>
          </form>
        )}

        {formType === 'outsider' && (
          <form onSubmit={handleOutsiderSubmit} className="space-y-4">
            <Alert>
              <AlertDescription>
                {isOutsiderCorrection
                  ? t.forms.correctOutsiderNote
                  : t.forms.outsiderNote}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="outsiderName">{t.forms.outsiderName}</Label>
              <Input
                id="outsiderName"
                type="text"
                placeholder={t.forms.outsiderNamePlaceholder}
                value={outsiderName}
                onChange={e => setOutsiderName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outsiderEmail">{t.forms.outsiderEmail}</Label>
              <Input
                id="outsiderEmail"
                type="text"
                placeholder={t.forms.outsiderEmailPlaceholder}
                aria-describedby="outsiderEmail-help"
                value={outsiderEmail}
                onChange={e => setOutsiderEmail(e.target.value)}
                className={
                  outsiderEmail && !isEmailValid ? 'border-destructive' : ''
                }
              />
              <p
                id="outsiderEmail-help"
                className="text-xs text-muted-foreground"
              >
                {t.forms.outsiderEmailHelp}
              </p>
              {outsiderEmail && !isEmailValid && (
                <p className="text-sm text-destructive">
                  {t.forms.emailInvalid}
                </p>
              )}
            </div>

            <Button type="submit" disabled={!isOutsiderFormValid || isPending}>
              {isOutsiderCorrection
                ? t.forms.correctOutsiderSubmit
                : t.forms.outsiderSubmit}
            </Button>
          </form>
        )}
      </div>

      {showConfirmation && confirmationData && (
        <ConfirmationDialog
          title={
            confirmationData.type === 'match'
              ? t.forms.confirmMatchTitle
              : t.forms.confirmOutsiderTitle
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
