import type { AuditRecord } from '@/types'

export const MESSAGES = {
  multipleMatching:
    "Multiple matching key holders found for iLOQ person 'John Doe' at Efecte",
  noMatching:
    'Unable to create a new key card in Efecte. No matching key holder was found for the specified iLOQ person (p1).',
  outsider:
    "The iLOQ person (p1) is an outsider, and we currently don't create Efecte keys for outsiders.",
  technical: 'Creating Efecte key failed. Server response: <error/>',
}

export function createAuditRecord(
  id: string,
  message: string,
  overrides: Partial<AuditRecord['iloqKey']> = {}
): AuditRecord {
  return {
    id,
    timestamp: '2026-10-15T09:30:00',
    from: 'ILOQ',
    to: 'EFECTE',
    message,
    iLoqId: `key-${id}`,
    customerCode: 'CC1',
    iloqKey: {
      fnKeyId: `key-${id}`,
      description: `Key ${id}`,
      realEstateId: 'building-a',
      realEstateName: 'Building A',
      state: 1,
      InfoText: '',
      person: {
        Person_ID: `person-${id}`,
        FirstName: 'John',
        LastName: `Doe ${id}`,
        eMail: '',
        Phone1: '',
        Phone2: '',
        Phone3: '',
        WorkTitle: '',
        CompanyName: '',
        Address: '',
        ZipCode: '',
        PostOffice: '',
        Country: '',
        PersonCode: '',
        LanguageCode: '',
        ContactInfo: '',
        Description: '',
        EmploymentEndDate: null,
        State: 0,
        ExternalCanEdit: false,
        ExternalPersonId: null,
      },
      securityAccesses: [],
      ...overrides,
    },
  }
}
