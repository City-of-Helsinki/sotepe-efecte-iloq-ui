import type { ILoqPerson } from '@/types'

interface PersonInformationProps {
  person: ILoqPerson
}

export function PersonInformation({ person }: PersonInformationProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-lg">Person Information (from iLOQ)</h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <div>
          <span className="font-medium">First Name:</span>{' '}
          {person.FirstName || '-'}
        </div>
        <div>
          <span className="font-medium">Last Name:</span>{' '}
          {person.LastName || '-'}
        </div>
        <div>
          <span className="font-medium">Email:</span> {person.eMail || '-'}
        </div>
        <div>
          <span className="font-medium">Phone 1:</span> {person.Phone1 || '-'}
        </div>
        <div>
          <span className="font-medium">Phone 2:</span> {person.Phone2 || '-'}
        </div>
        <div>
          <span className="font-medium">Phone 3:</span> {person.Phone3 || '-'}
        </div>
        <div>
          <span className="font-medium">Work Title:</span>{' '}
          {person.WorkTitle || '-'}
        </div>
        <div>
          <span className="font-medium">Company Name:</span>{' '}
          {person.CompanyName || '-'}
        </div>
        <div>
          <span className="font-medium">Address:</span> {person.Address || '-'}
        </div>
        <div>
          <span className="font-medium">Zip Code:</span> {person.ZipCode || '-'}
        </div>
        <div>
          <span className="font-medium">Post Office:</span>{' '}
          {person.PostOffice || '-'}
        </div>
        <div>
          <span className="font-medium">Country:</span> {person.Country || '-'}
        </div>
        <div>
          <span className="font-medium">Person Code:</span>{' '}
          {person.PersonCode || '-'}
        </div>
        <div>
          <span className="font-medium">Language Code:</span>{' '}
          {person.LanguageCode || '-'}
        </div>
        <div>
          <span className="font-medium">Contact Info:</span>{' '}
          {person.ContactInfo || '-'}
        </div>
        <div>
          <span className="font-medium">Description:</span>{' '}
          {person.Description || '-'}
        </div>
        <div>
          <span className="font-medium">Employment End Date:</span>{' '}
          {person.EmploymentEndDate || '-'}
        </div>
        <div>
          <span className="font-medium">State:</span> {person.State}
        </div>
        <div>
          <span className="font-medium">External Can Edit:</span>{' '}
          {person.ExternalCanEdit ? 'true' : 'false'}
        </div>
        <div>
          <span className="font-medium">External Person ID:</span>{' '}
          {person.ExternalPersonId || '-'}
        </div>
      </div>
    </div>
  )
}
