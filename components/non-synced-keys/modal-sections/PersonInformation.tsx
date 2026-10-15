'use client'

import type { ILoqPerson } from '@/types'
import { useI18n } from '@/components/providers/language-provider'

interface PersonInformationProps {
  person: ILoqPerson
}

export function PersonInformation({ person }: PersonInformationProps) {
  const { t } = useI18n()

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">{t.personInformation.title}</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="font-medium">{t.personInformation.firstName}</span>{' '}
          {person.FirstName || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.lastName}</span>{' '}
          {person.LastName || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.email}</span>{' '}
          {person.eMail || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.phone1}</span>{' '}
          {person.Phone1 || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.phone2}</span>{' '}
          {person.Phone2 || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.phone3}</span>{' '}
          {person.Phone3 || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.workTitle}</span>{' '}
          {person.WorkTitle || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.companyName}</span>{' '}
          {person.CompanyName || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.address}</span>{' '}
          {person.Address || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.zipCode}</span>{' '}
          {person.ZipCode || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.postOffice}</span>{' '}
          {person.PostOffice || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.country}</span>{' '}
          {person.Country || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.personCode}</span>{' '}
          {person.PersonCode || '-'}
        </div>
        <div>
          <span className="font-medium">
            {t.personInformation.languageCode}
          </span>{' '}
          {person.LanguageCode || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.contactInfo}</span>{' '}
          {person.ContactInfo || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.description}</span>{' '}
          {person.Description || '-'}
        </div>
        <div>
          <span className="font-medium">
            {t.personInformation.employmentEndDate}
          </span>{' '}
          {person.EmploymentEndDate || '-'}
        </div>
        <div>
          <span className="font-medium">{t.personInformation.state}</span>{' '}
          {person.State}
        </div>
        <div>
          <span className="font-medium">
            {t.personInformation.externalCanEdit}
          </span>{' '}
          {person.ExternalCanEdit
            ? t.personInformation.yes
            : t.personInformation.no}
        </div>
        <div>
          <span className="font-medium">
            {t.personInformation.externalPersonId}
          </span>{' '}
          {person.ExternalPersonId || '-'}
        </div>
      </div>
    </div>
  )
}
