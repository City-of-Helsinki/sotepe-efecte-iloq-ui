import { getRedisClient } from '../lib/redis/client'
import type { AuditRecord } from '../types'

const redis = getRedisClient()

// Sample data for multiple matching persons scenario
const sampleAuditRecords: AuditRecord[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Multiple matching key holders found for iLOQ person',
    iLoqId: 'key-001',
    iloqKey: {
      fnKeyId: 'key-001',
      description: 'Main Entrance Key',
      realEstateId: 'building-a',
      realEstateName: 'Building A - Headquarters',
      state: 1,
      InfoText: 'Key for main entrance',
      person: {
        Person_ID: 'person-001',
        FirstName: 'John',
        LastName: 'Doe',
        eMail: 'john.doe@example.com',
        Phone1: '+358401234567',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'Manager',
        CompanyName: 'Helsinki City',
        Address: 'Street 1',
        ZipCode: '00100',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'JD001',
        LanguageCode: 'fi',
        ContactInfo: '',
        Description: 'Department manager',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [
        {
          Name: 'Main Entrance',
          RealEstate_ID: 'building-a',
          SecurityAccess_ID: 'access-001',
        },
        {
          Name: 'Parking Garage',
          RealEstate_ID: 'building-a',
          SecurityAccess_ID: 'access-002',
        },
      ],
    },
  },
  {
    id: '2',
    timestamp: new Date().toISOString(),
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'No matching key holder / outsider found',
    iLoqId: 'key-002',
    iloqKey: {
      fnKeyId: 'key-002',
      description: 'Office Room 301',
      realEstateId: 'building-a',
      realEstateName: 'Building A - Headquarters',
      state: 1,
      InfoText: 'Office access key',
      person: {
        Person_ID: 'person-002',
        FirstName: 'Jane',
        LastName: 'Smith',
        eMail: 'jane.smith@example.com',
        Phone1: '+358501234567',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'Senior Analyst',
        CompanyName: 'Helsinki City',
        Address: 'Street 2',
        ZipCode: '00100',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'JS001',
        LanguageCode: 'fi',
        ContactInfo: '',
        Description: '',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [
        {
          Name: 'Office Floor 3',
          RealEstate_ID: 'building-a',
          SecurityAccess_ID: 'access-003',
        },
      ],
    },
  },
  {
    id: '3',
    timestamp: new Date().toISOString(),
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Multiple matching key holders found for iLOQ person',
    iLoqId: 'key-003',
    iloqKey: {
      fnKeyId: 'key-003',
      description: 'Server Room Access',
      realEstateId: 'building-b',
      realEstateName: 'Building B - Data Center',
      state: 1,
      InfoText: 'Restricted area',
      person: {
        Person_ID: 'person-003',
        FirstName: 'Bob',
        LastName: 'Johnson',
        eMail: 'bob.johnson@example.com',
        Phone1: '+358451234567',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'IT Administrator',
        CompanyName: 'Helsinki City',
        Address: 'Street 3',
        ZipCode: '00200',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'BJ001',
        LanguageCode: 'en',
        ContactInfo: '',
        Description: 'IT Department',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [
        {
          Name: 'Server Room',
          RealEstate_ID: 'building-b',
          SecurityAccess_ID: 'access-004',
        },
        {
          Name: 'Network Equipment Room',
          RealEstate_ID: 'building-b',
          SecurityAccess_ID: 'access-005',
        },
      ],
    },
  },
  {
    id: '4',
    timestamp: new Date().toISOString(),
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'No matching key holder / outsider found',
    iLoqId: 'key-004',
    iloqKey: {
      fnKeyId: 'key-004',
      description: 'Meeting Room B',
      realEstateId: 'building-b',
      realEstateName: 'Building B - Data Center',
      state: 1,
      InfoText: 'Conference room key',
      person: {
        Person_ID: 'person-004',
        FirstName: 'Alice',
        LastName: 'Williams',
        eMail: 'alice.williams@example.com',
        Phone1: '+358401111111',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'Project Manager',
        CompanyName: 'Helsinki City',
        Address: 'Street 4',
        ZipCode: '00200',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'AW001',
        LanguageCode: 'fi',
        ContactInfo: '',
        Description: '',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [
        {
          Name: 'Meeting Rooms',
          RealEstate_ID: 'building-b',
          SecurityAccess_ID: 'access-006',
        },
      ],
    },
  },
  {
    id: '5',
    timestamp: new Date().toISOString(),
    from: 'ILOQ',
    to: 'EFECTE',
    message: 'Multiple matching key holders found for iLOQ person',
    iLoqId: 'key-005',
    iloqKey: {
      fnKeyId: 'key-005',
      description: 'Storage Room 1A',
      realEstateId: 'building-c',
      realEstateName: 'Building C - Warehouse',
      state: 1,
      InfoText: 'Storage access',
      person: {
        Person_ID: 'person-005',
        FirstName: 'Charlie',
        LastName: 'Brown',
        eMail: 'charlie.brown@example.com',
        Phone1: '+358402222222',
        Phone2: '',
        Phone3: '',
        WorkTitle: 'Logistics Coordinator',
        CompanyName: 'Helsinki City',
        Address: 'Street 5',
        ZipCode: '00300',
        PostOffice: 'Helsinki',
        Country: 'Finland',
        PersonCode: 'CB001',
        LanguageCode: 'fi',
        ContactInfo: '',
        Description: 'Warehouse team',
        EmploymentEndDate: '',
        State: 1,
        ExternalCanEdit: true,
        ExternalPersonId: '',
      },
      securityAccesses: [
        {
          Name: 'Storage Areas',
          RealEstate_ID: 'building-c',
          SecurityAccess_ID: 'access-007',
        },
      ],
    },
  },
]

// Sample Efecte persons for the "multiple matching" scenarios
const efectePersonsForPerson001 = [
  {
    id: '123456',
    name: 'John Doe',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '123456',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00012345',
      },
      { id: '1338', name: 'Koko nimi', code: 'full_name', value: 'John Doe' },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'john.doe@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358401234567',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 11111',
      },
      { id: '1339', name: 'Titteli', code: 'title', value: 'Manager' },
      {
        id: '1769',
        name: 'Department',
        code: 'department',
        value: 'IT Services',
      },
      { id: '1770', name: 'Office', code: 'office', value: 'Helsinki Office' },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
  {
    id: '789012',
    name: 'John Doe',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '789012',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00067890',
      },
      { id: '1338', name: 'Koko nimi', code: 'full_name', value: 'John Doe' },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'j.doe@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358407654321',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 22222',
      },
      { id: '1339', name: 'Titteli', code: 'title', value: 'Senior Manager' },
      { id: '1769', name: 'Department', code: 'department', value: 'HR' },
      { id: '1770', name: 'Office', code: 'office', value: 'Espoo Office' },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
]

const efectePersonsForPerson003 = [
  {
    id: '345678',
    name: 'Bob Johnson',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '345678',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00034567',
      },
      {
        id: '1338',
        name: 'Koko nimi',
        code: 'full_name',
        value: 'Bob Johnson',
      },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'bob.johnson@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358401111111',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 33333',
      },
      {
        id: '1339',
        name: 'Titteli',
        code: 'title',
        value: 'System Administrator',
      },
      {
        id: '1769',
        name: 'Department',
        code: 'department',
        value: 'IT Infrastructure',
      },
      {
        id: '1770',
        name: 'Office',
        code: 'office',
        value: 'Vantaa Data Center',
      },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
  {
    id: '901234',
    name: 'Robert Johnson',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '901234',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00090123',
      },
      {
        id: '1338',
        name: 'Koko nimi',
        code: 'full_name',
        value: 'Robert Johnson',
      },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'robert.johnson@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358402222222',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 44444',
      },
      {
        id: '1339',
        name: 'Titteli',
        code: 'title',
        value: 'Security Specialist',
      },
      {
        id: '1769',
        name: 'Department',
        code: 'department',
        value: 'IT Security',
      },
      {
        id: '1770',
        name: 'Office',
        code: 'office',
        value: 'Helsinki Security Center',
      },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
]

const efectePersonsForPerson005 = [
  {
    id: '567890',
    name: 'Charlie Brown',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '567890',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00056789',
      },
      {
        id: '1338',
        name: 'Koko nimi',
        code: 'full_name',
        value: 'Charlie Brown',
      },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'charlie.brown@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358403333333',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 55555',
      },
      {
        id: '1339',
        name: 'Titteli',
        code: 'title',
        value: 'Logistics Coordinator',
      },
      {
        id: '1769',
        name: 'Department',
        code: 'department',
        value: 'Logistics',
      },
      { id: '1770', name: 'Office', code: 'office', value: 'Warehouse C' },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
  {
    id: '112233',
    name: 'Charles Brown',
    attributes: [
      {
        id: '3537',
        name: 'entity_id',
        code: 'person_entityid',
        value: '112233',
      },
      {
        id: '1350',
        name: 'Efecte ID',
        code: 'efecte_id',
        value: 'PER-00011223',
      },
      {
        id: '1338',
        name: 'Koko nimi',
        code: 'full_name',
        value: 'Charles Brown',
      },
      {
        id: '1341',
        name: 'Sähköposti',
        code: 'email',
        value: 'c.brown@helsinki.fi',
      },
      {
        id: '1340',
        name: 'Matkapuhelin',
        code: 'mobile',
        value: '+358404444444',
      },
      {
        id: '1343',
        name: 'Puhelinnumero',
        code: 'phone',
        value: '(09) 310 66666',
      },
      {
        id: '1339',
        name: 'Titteli',
        code: 'title',
        value: 'Warehouse Manager',
      },
      {
        id: '1769',
        name: 'Department',
        code: 'department',
        value: 'Warehouse',
      },
      { id: '1770', name: 'Office', code: 'office', value: 'Warehouse Main' },
      { id: '1782', name: 'Status', code: 'status', value: 'Active' },
    ],
  },
]

async function seedRedis() {
  try {
    console.log('🌱 Seeding Redis with sample data...\n')

    // Clear existing audit records
    const existingKeys = await redis.keys(
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:*:*'
    )
    if (existingKeys.length > 0) {
      await redis.del(...existingKeys)
      console.log(`✓ Cleared ${existingKeys.length} existing audit records`)
    }

    // Clear existing Efecte person records
    const existingPersonKeys = await redis.keys(
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:*'
    )
    if (existingPersonKeys.length > 0) {
      await redis.del(...existingPersonKeys)
      console.log(
        `✓ Cleared ${existingPersonKeys.length} existing person records`
      )
    }

    // Store audit records
    for (const record of sampleAuditRecords) {
      const key = `efecte-iLoq-synchronization-integration:auditRecord:iLoq:key:${record.iloqKey.realEstateId}:${record.iloqKey.fnKeyId}`
      await redis.set(key, JSON.stringify(record))
      console.log(`✓ Created audit record: ${record.iloqKey.description}`)
    }

    // Store Efecte persons for multiple matching scenarios
    await redis.set(
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:person-001',
      JSON.stringify(efectePersonsForPerson001)
    )
    console.log('✓ Created Efecte persons for person-001 (John Doe)')

    await redis.set(
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:person-003',
      JSON.stringify(efectePersonsForPerson003)
    )
    console.log('✓ Created Efecte persons for person-003 (Bob Johnson)')

    await redis.set(
      'efecte-iLoq-synchronization-integration:auditRecord:iLoq:person:person-005',
      JSON.stringify(efectePersonsForPerson005)
    )
    console.log('✓ Created Efecte persons for person-005 (Charlie Brown)')

    // Store last integration timestamp
    const timestamp = new Date()
    const formattedTimestamp = `${timestamp.getFullYear()}:${String(timestamp.getMonth() + 1).padStart(2, '0')}:${String(timestamp.getDate()).padStart(2, '0')} ${String(timestamp.getHours()).padStart(2, '0')}:${String(timestamp.getMinutes()).padStart(2, '0')}:${String(timestamp.getSeconds()).padStart(2, '0')}`

    await redis.set(
      'efecte-iLoq-synchronization-integration:previousSyncEndedAt',
      formattedTimestamp
    )
    console.log(`✓ Set integration timestamp: ${formattedTimestamp}`)

    console.log('\n✅ Redis seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - 5 audit records created`)
    console.log(
      `   - 3 real estates: Building A (2 keys), Building B (2 keys), Building C (1 key)`
    )
    console.log(`   - 3 "Multiple matching" scenarios with Efecte persons`)
    console.log(`   - 2 "No matching" scenarios`)
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
