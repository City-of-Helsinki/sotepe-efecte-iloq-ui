import { getRedisClient } from '../lib/redis/client'
import type { AuditRecord, EfectePerson, ILoqPerson } from '../types'

const redis = getRedisClient()

const PREFIX = 'efecte-iLoq-synchronization-integration'
const CUSTOMER_CODE = 'ILOQ_DEV_1'
// Same as the production AUDIT_EXCEPTION_EXPIRATION_SECONDS (3 days)
const AUDIT_RECORD_TTL_SECONDS = 259200

// Audit messages exactly as the integration writes them
const messages = {
  multipleMatching: (name: string) =>
    `Multiple matching key holders found for iLOQ person '${name}' at Efecte`,
  noMatching: (personId: string) =>
    `Unable to create a new key card in Efecte. No matching key holder was found for the specified iLOQ person (${personId}).`,
  outsider: (personId: string) =>
    `The iLOQ person (${personId}) is an outsider, and we currently don't create Efecte keys for outsiders.`,
  // Technical failures are not shown in the UI
  efecteCreateFailed:
    'Creating Efecte key failed. Server response: <entityset><error>Required attribute missing</error></entityset>',
  iLoqUpdateFailed:
    'Processing an iLOQ key failed (operation: update). Server response: {"Message":"Key is being programmed"}',
}

const realEstates = {
  kamppi: {
    id: '30853116-530b-4884-84a0-740a4aaa976f',
    name: '100 Malminkatu 3, Kampin perhekeskus',
  },
  ruoholahti: {
    id: 'c17e6900-0e68-4153-a6f9-316797664ba5',
    name: '180 Itämerenkatu 5, Koy Itämerenkatu 5',
  },
  malmi: {
    id: '7d1f0c2a-5b8e-4f3a-9c1d-2e6b8a4f0c11',
    name: '700 Ala-Malmin tori 1, Malmin perhekeskus',
  },
  // Has only technical failures, so the whole real estate is hidden in the UI
  sturenkatu: {
    id: '926d4480-c419-481e-beb8-d63d68933dca',
    name: '510 Sturenkatu 8, Sturenkadun palvelukeskus',
  },
}

type RealEstate = (typeof realEstates)[keyof typeof realEstates]

function iLoqPerson(
  personId: string,
  firstName: string,
  lastName: string,
  extra: Partial<ILoqPerson> = {}
): ILoqPerson {
  return {
    Person_ID: personId,
    FirstName: firstName,
    LastName: lastName,
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
    LanguageCode: 'fi-FI',
    ContactInfo: '',
    Description: '',
    EmploymentEndDate: null,
    State: 0,
    ExternalCanEdit: true,
    ExternalPersonId: null,
    ...extra,
  }
}

let recordCounter = 0

function auditRecord(
  realEstate: RealEstate,
  description: string,
  person: ILoqPerson,
  message: string,
  securityAccesses: string[],
  options: { customerCode?: string | null; state?: number } = {}
): AuditRecord {
  recordCounter++
  const keyId = `seed-key-${String(recordCounter).padStart(3, '0')}`
  // The integration writes a local time without a time zone, e.g. "2026-10-15T09:30:00"
  const time = new Date(Date.now() - recordCounter * 60_000)
  const timestamp = new Date(time.getTime() - time.getTimezoneOffset() * 60_000)

  return {
    id: `seed-${recordCounter}`,
    timestamp: timestamp.toISOString().slice(0, 19),
    from: 'ILOQ',
    to: 'EFECTE',
    message,
    iLoqId: keyId,
    // null = an old record written before the customer code was added
    ...(options.customerCode === null
      ? {}
      : { customerCode: options.customerCode ?? CUSTOMER_CODE }),
    iloqKey: {
      fnKeyId: keyId,
      description,
      realEstateId: realEstate.id,
      realEstateName: realEstate.name,
      state: options.state ?? 1,
      InfoText: '',
      person,
      securityAccesses: securityAccesses.map((name, index) => ({
        Name: name,
        RealEstate_ID: realEstate.id,
        SecurityAccess_ID: `${keyId}-sa-${index + 1}`,
      })),
    },
  }
}

function efectePerson(
  entityId: string,
  efecteId: string,
  fullName: string,
  details: {
    email: string
    title: string
    department: string
    office: string
    status: 'Active' | 'Inactive'
    streetAddresses?: string[]
  }
): EfectePerson {
  return {
    id: entityId,
    name: fullName,
    attributes: [
      {
        id: '3537',
        name: 'Entity ID',
        code: 'person_entityid',
        value: entityId,
      },
      { id: '1350', name: 'Efecte ID', code: 'efecte_id', value: efecteId },
      { id: '1338', name: 'Koko nimi', code: 'full_name', value: fullName },
      { id: '1341', name: 'Sähköposti', code: 'email', value: details.email },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358 40 123 4567',
      },
      { id: '1343', name: 'Puhelin', code: 'phone', value: '09 310 12345' },
      { id: '1339', name: 'Titteli', code: 'title', value: details.title },
      {
        id: '1769',
        name: 'Osasto',
        code: 'department',
        value: details.department,
      },
      { id: '1770', name: 'Toimipiste', code: 'office', value: details.office },
      { id: '1782', name: 'Status', code: 'status', value: details.status },
      {
        id: '9999',
        name: 'Katuosoite',
        code: 'street_address',
        references: (details.streetAddresses ?? []).map((name, index) => ({
          id: `${entityId}-addr-${index + 1}`,
          name,
        })),
      },
    ],
  }
}

// Multiple matching persons, each with the Efecte persons found by name
const taru = iLoqPerson(
  '8b20eb5c-3ab2-427a-ba1b-72b0aa000001',
  'Taru',
  'Paavilainen',
  {
    ExternalPersonId: '5120001',
  }
)
const pia = iLoqPerson(
  '8b20eb5c-3ab2-427a-ba1b-72b0aa000002',
  'Pia',
  'Andersson',
  {
    WorkTitle: 'Sairaanhoitaja',
  }
)
const mikko = iLoqPerson(
  '8b20eb5c-3ab2-427a-ba1b-72b0aa000003',
  'Mikko',
  'Virtanen'
)

const efectePersonsByILoqPerson: Record<string, EfectePerson[]> = {
  [taru.Person_ID]: [
    efectePerson('5120001', 'PER-00051201', 'Taru Paavilainen', {
      email: 'taru.paavilainen@hel.fi',
      title: 'Terveydenhoitaja',
      department: 'Perhekeskukset',
      office: 'Kampin perhekeskus',
      status: 'Active',
      streetAddresses: ['Malminkatu 3, 00100, Helsinki'],
    }),
    efectePerson('5120002', 'PER-00051202', 'Taru Paavilainen', {
      email: 'taru.k.paavilainen@hel.fi',
      title: 'Sosiaaliohjaaja',
      department: 'Aikuissosiaalityö',
      office: 'Kallion sosiaaliasema',
      status: 'Active',
      streetAddresses: ['Toinen linja 4, 00530, Helsinki'],
    }),
  ],
  [pia.Person_ID]: [
    efectePerson('4980101', 'PER-00049801', 'Pia Andersson', {
      email: 'pia.andersson@hel.fi',
      title: 'Sairaanhoitaja',
      department: 'Terveysasemat',
      office: 'Ruoholahden terveysasema',
      status: 'Inactive',
    }),
    efectePerson('5198858', 'PER-00051988', 'Pia Andersson', {
      email: 'pia.andersson2@hel.fi',
      title: 'Sairaanhoitaja',
      department: 'Terveysasemat',
      office: 'Ruoholahden terveysasema',
      status: 'Active',
      streetAddresses: ['Itämerenkatu 5, 00180, Helsinki'],
    }),
    efectePerson('5198900', 'PER-00051990', 'Pia Andersson', {
      email: 'pia.m.andersson@hel.fi',
      title: 'Toimistosihteeri',
      department: 'Hallinto',
      office: 'Kaupungintalo',
      status: 'Active',
    }),
  ],
  [mikko.Person_ID]: [
    efectePerson('3001001', 'PER-00030010', 'Mikko Virtanen', {
      email: 'mikko.virtanen@hel.fi',
      title: 'Vahtimestari',
      department: 'Kiinteistöpalvelut',
      office: 'Ruoholahti',
      status: 'Active',
      streetAddresses: ['Itämerenkatu 5, 00180, Helsinki'],
    }),
    efectePerson('3001002', 'PER-00030020', 'Mikko Virtanen', {
      email: 'mikko.j.virtanen@hel.fi',
      title: 'IT-tukihenkilö',
      department: 'Digitalisaatio',
      office: 'Kalasatama',
      status: 'Active',
    }),
  ],
}

// Outsider registrations (person mappings), shown in the key details of the outsider category
const outsiderMappings: Record<
  string,
  { outsiderName: string; outsiderEmail: string }
> = {
  '8b20eb5c-3ab2-427a-ba1b-72b0aa000006': {
    outsiderName: 'Olli Ulkopuolinen',
    outsiderEmail: 'Aulapalvelut.KampinPerhekeskus@hel.fi',
  },
  '8b20eb5c-3ab2-427a-ba1b-72b0aa000008': {
    outsiderName: 'Sanna Siivooja',
    outsiderEmail: 'sanna@siivous.fi',
  },
}

const auditRecords: AuditRecord[] = [
  // Kampin perhekeskus: all three categories and one hidden technical failure
  auditRecord(
    realEstates.kamppi,
    '001 Kampin pk yleisavain',
    taru,
    messages.multipleMatching('Taru Paavilainen'),
    ['001. Kampin pk yleisavain', '004.03 Kampin pk 1. kerros']
  ),
  auditRecord(
    realEstates.kamppi,
    '002 Kampin pk huoltoavain',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000004', 'Rosa', 'Priuska'),
    messages.noMatching('8b20eb5c-3ab2-427a-ba1b-72b0aa000004'),
    ['002. Kampin pk huoltoavain']
  ),
  auditRecord(
    realEstates.kamppi,
    '004.04 Kampin pk 2. kerros',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000005', 'Matti', 'Meikäläinen', {
      Description: 'Sijainen syksy 2026',
    }),
    messages.noMatching('8b20eb5c-3ab2-427a-ba1b-72b0aa000005'),
    ['004.04 Kampin pk 2. kerros']
  ),
  auditRecord(
    realEstates.kamppi,
    '006 Kampin pk vahtimestariavain',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000006', 'Olli', 'Ulkopuolinen', {
      CompanyName: 'Kiinteistöhuolto Oy',
      eMail: 'olli@kiinteistohuolto.fi',
      ExternalPersonId: 'olli@kiinteistohuolto.fi#OLUL',
    }),
    messages.outsider('8b20eb5c-3ab2-427a-ba1b-72b0aa000006'),
    ['006 Kampin pk vahtimestariavain']
  ),
  auditRecord(
    realEstates.kamppi,
    '005 Kampin pk lääkehuone',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000007', 'Liisa', 'Lääkäri'),
    messages.efecteCreateFailed,
    ['005 Kampin pk lääkehuone']
  ),

  // Ruoholahti: two multiple matching cases and an outsider
  auditRecord(
    realEstates.ruoholahti,
    '01. Ruoholahti henkilökunta',
    pia,
    messages.multipleMatching('Pia Andersson'),
    ['01. Ruoholahti henkilökunta', '02. Ruoholahti henkilökunta + lääkehuone']
  ),
  auditRecord(
    realEstates.ruoholahti,
    '03. Ruoholahti tekniset tilat',
    mikko,
    messages.multipleMatching('Mikko Virtanen'),
    ['03. Ruoholahti tekniset tilat']
  ),
  auditRecord(
    realEstates.ruoholahti,
    '01. Ruoholahti henkilökunta (siivous)',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000008', 'Sanna', 'Siivooja', {
      CompanyName: 'Siivous Oy',
      ExternalPersonId: 'sanna@siivous.fi#SASI',
    }),
    messages.outsider('8b20eb5c-3ab2-427a-ba1b-72b0aa000008'),
    ['01. Ruoholahti henkilökunta']
  ),

  // Malmi: a returned key and an old record without a customer code (saving shows the "try later" message)
  auditRecord(
    realEstates.malmi,
    'Malmin pk ulko-ovi',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000009', 'Kalle', 'Palautettu', {
      EmploymentEndDate: '2026-08-31',
    }),
    messages.noMatching('8b20eb5c-3ab2-427a-ba1b-72b0aa000009'),
    ['Malmin pk ulko-ovi'],
    { state: 4 }
  ),
  auditRecord(
    realEstates.malmi,
    'Malmin pk henkilökunta',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000010', 'Vilma', 'Vanharivi'),
    messages.noMatching('8b20eb5c-3ab2-427a-ba1b-72b0aa000010'),
    ['Malmin pk henkilökunta'],
    { customerCode: null }
  ),

  // Sturenkatu: only technical failures, the real estate is not shown at all
  auditRecord(
    realEstates.sturenkatu,
    '3- SAS palvelut',
    iLoqPerson('8b20eb5c-3ab2-427a-ba1b-72b0aa000011', 'Henri', 'Hoitaja'),
    messages.iLoqUpdateFailed,
    ['103 Sas-Palvelut']
  ),
]

async function deleteByPattern(pattern: string): Promise<number> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
  return keys.length
}

async function seedRedis() {
  try {
    console.log('🌱 Seeding Redis with sample data...\n')

    const deletedRecords = await deleteByPattern(`${PREFIX}:auditRecord:iLoq:*`)
    console.log(`✓ Cleared ${deletedRecords} existing audit records`)

    const deletedMappings = await deleteByPattern(
      `${PREFIX}:mapped:person:*:${CUSTOMER_CODE}:*`
    )
    console.log(`✓ Cleared ${deletedMappings} existing person mappings`)

    for (const record of auditRecords) {
      const key = `${PREFIX}:auditRecord:iLoq:key:${record.iloqKey.realEstateId}:${record.iloqKey.fnKeyId}`
      await redis.set(
        key,
        JSON.stringify(record),
        'EX',
        AUDIT_RECORD_TTL_SECONDS
      )
    }
    console.log(`✓ Created ${auditRecords.length} audit records`)

    for (const [personId, persons] of Object.entries(
      efectePersonsByILoqPerson
    )) {
      await redis.set(
        `${PREFIX}:auditRecord:iLoq:person:${personId}`,
        JSON.stringify(persons),
        'EX',
        AUDIT_RECORD_TTL_SECONDS
      )
    }
    console.log(
      `✓ Created Efecte person lists for ${Object.keys(efectePersonsByILoqPerson).length} multiple matching cases`
    )

    for (const [personId, mapping] of Object.entries(outsiderMappings)) {
      await redis.set(
        `${PREFIX}:mapped:person:iLoq:${CUSTOMER_CODE}:${personId}`,
        JSON.stringify(mapping)
      )
    }
    console.log(
      `✓ Created outsider registrations for ${Object.keys(outsiderMappings).length} persons`
    )

    // Same format as the integration: "yyyy:MM:dd HH:mm:ss"
    const now = new Date()
    const pad = (value: number) => String(value).padStart(2, '0')
    const timestamp = `${now.getFullYear()}:${pad(now.getMonth() + 1)}:${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    await redis.set(`${PREFIX}:previousSyncEndedAt`, timestamp)
    console.log(`✓ Set integration timestamp: ${timestamp}`)

    console.log('\n✅ Redis seeding completed successfully!')
    console.log('\n📊 Shown in the UI (3 real estates, 9 keys):')
    console.log(
      '   - Kampin perhekeskus: multiple matching, 2 × no matching, outsider'
    )
    console.log(
      '   - Ruoholahti: 2 × multiple matching (with active and inactive persons), outsider'
    )
    console.log(
      '   - Malmi: returned key, and an old record without a customer code (save → "try later")'
    )
    console.log('\n🙈 Hidden from the UI (technical failures):')
    console.log('   - Kampin perhekeskus: Efecte key creation failed')
    console.log(
      '   - Sturenkatu: iLOQ key update failed (the whole real estate is hidden)'
    )
    console.log(
      '\n🌐 Visit http://localhost:3000/non-synced-keys to see the data!'
    )

    await redis.quit()
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding Redis:', error)
    await redis.quit()
    process.exit(1)
  }
}

seedRedis()
