'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { AuditRecord, FailureCategory } from '@/types'
import { SyncInformation } from './modal-sections/SyncInformation'
import { KeyDetails } from './modal-sections/KeyDetails'
import { PersonInformation } from './modal-sections/PersonInformation'
import { MatchingPersons } from './modal-sections/MatchingPersons'
import { ManualEntryForms } from './modal-sections/ManualEntryForms'
import { CategoryGuidance } from './CategoryGuidance'
import { useI18n } from '@/components/providers/language-provider'

interface KeyDetailsModalProps {
  keyData: AuditRecord
  failureCategory: FailureCategory
  onClose: () => void
  onSuccess: () => void
}

export function KeyDetailsModal({
  keyData,
  failureCategory,
  onClose,
  onSuccess,
}: KeyDetailsModalProps) {
  const { t } = useI18n()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showCloseWarning, setShowCloseWarning] = useState(false)

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowCloseWarning(true)
    } else {
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowCloseWarning(false)
    onClose()
  }

  const handleSuccess = () => {
    setHasUnsavedChanges(false)
    onSuccess()
  }

  return (
    <>
      <Dialog open={true} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-[800px] max-h-[80vh] overflow-y-auto"
          onPointerDownOutside={e => e.preventDefault()}
          onInteractOutside={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t.keyDetailsModal.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            <SyncInformation keyData={keyData} />
            <KeyDetails keyData={keyData} />
            <PersonInformation person={keyData.iloqKey.person} />
            <CategoryGuidance category={failureCategory} />

            {failureCategory === 'multiple_matching' && (
              <MatchingPersons
                personId={keyData.iloqKey.person.Person_ID}
                keyData={keyData}
                onSuccess={handleSuccess}
              />
            )}

            <ManualEntryForms
              keyData={keyData}
              failureCategory={failureCategory}
              onSuccess={handleSuccess}
              onFormChange={setHasUnsavedChanges}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Close warning dialog */}
      {showCloseWarning && (
        <Dialog open={true} onOpenChange={() => setShowCloseWarning(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.keyDetailsModal.unsavedTitle}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              {t.keyDetailsModal.unsavedMessage}
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowCloseWarning(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-accent"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmClose}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                {t.common.confirm}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
