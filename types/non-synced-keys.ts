// Audit record from Redis
export interface AuditRecord {
  id: string
  timestamp: string
  from: 'ILOQ' | 'EFECTE'
  to: 'ILOQ' | 'EFECTE'
  entityId?: string
  efecteId?: string
  message: string
  iLoqId: string
  iloqKey: ILoqKey
}

export interface ILoqKey {
  fnKeyId: string
  description: string
  realEstateId: string
  realEstateName: string
  state: number
  InfoText: string
  person: ILoqPerson
  securityAccesses: SecurityAccess[]
}

export interface ILoqPerson {
  Person_ID: string
  FirstName: string
  LastName: string
  eMail: string
  Phone1: string
  Phone2: string
  Phone3: string
  WorkTitle: string
  CompanyName: string
  Address: string
  ZipCode: string
  PostOffice: string
  Country: string
  PersonCode: string
  LanguageCode: string
  ContactInfo: string
  Description: string
  EmploymentEndDate: string | null
  State: number
  ExternalCanEdit: boolean
  ExternalPersonId: string | null
}

export interface SecurityAccess {
  Name: string
  RealEstate_ID: string
  SecurityAccess_ID: string
}

// Efecte person structure
export interface EfectePersonAttribute {
  id: string
  name: string
  code?: string
  values?: string[]
  value?: string
  references?: EfecteReference[]
}

export interface EfecteReference {
  id: string
  name: string
}

export interface EfectePerson {
  id: string
  name: string
  attributes: EfectePersonAttribute[]
}

// Person mapping structures
export interface PersonMapping {
  entityId: string
  efecteId: string
}

export interface OutsiderMapping {
  outsiderName: string
  outsiderEmail: string
}

// Failure categories
export type FailureCategory = 'multiple_matching' | 'no_matching'

// Direction type
export type SyncDirection = 'ILOQ_TO_EFECTE' | 'EFECTE_TO_ILOQ'

// Grouped data for UI
export interface RealEstateGroup {
  realEstateId: string
  realEstateName: string
  totalKeys: number
  keys: AuditRecord[]
}

export interface DirectionGroup {
  direction: SyncDirection
  displayText: string
  categories: CategoryGroup[]
}

export interface CategoryGroup {
  category: FailureCategory
  displayText: string
  keys: AuditRecord[]
}

// API responses
export interface NonSyncedKeysResponse {
  realEstates: RealEstateGroup[]
  lastIntegrationRun: string | null
}

export interface EfectePersonsResponse {
  persons: EfectePerson[]
}

export interface SaveMappingResponse {
  success: boolean
  error?: string
}

// Helper types for mutations
export interface SaveMappingData {
  personId: string
  realEstateId: string
  keyId: string
  mapping: PersonMapping | OutsiderMapping
}
