import type { Language } from './config'

// The Finnish dictionary defines the shape of all dictionaries. Every other language must provide
// exactly the same keys, so a missing or extra translation fails the type check and the build.
const fi = {
  common: {
    appName: 'Efecte-iLOQ-integraatio',
    appDescription: 'Efecte-iLOQ-integraation hallintakäyttöliittymä',
    loading: 'Ladataan...',
    cancel: 'Peruuta',
    confirm: 'Vahvista',
    confirming: 'Vahvistetaan...',
    close: 'Sulje',
    dateTimeSeparator: 'klo',
  },
  languageSwitcher: {
    label: 'Kieli',
    fi: 'Suomi',
    en: 'English',
  },
  nav: {
    dashboard: 'Etusivu',
    nonSyncedKeys: 'Synkronoimattomat avaimet',
  },
  login: {
    subtitle: 'Kirjaudu sisään hallintakäyttöliittymään',
    username: 'Käyttäjätunnus',
    password: 'Salasana',
    signIn: 'Kirjaudu sisään',
    signingIn: 'Kirjaudutaan...',
    invalidCredentials: 'Virheellinen käyttäjätunnus tai salasana',
    loginError: 'Kirjautumisessa tapahtui virhe',
  },
  dashboard: {
    title: 'Efecte-iLOQ-integraation etusivu',
    description:
      'Tämä on Efecte-iLOQ-integraation hallintakäyttöliittymän etusivu. Uusia toimintoja voidaan lisätä myöhemmissä vaiheissa.',
  },
  errorPage: {
    title: 'Jotain meni vikaan',
    description: 'Tapahtui odottamaton virhe. Yritä uudelleen.',
    errorId: (digest: string) => `Virhetunnus: ${digest}`,
    tryAgain: 'Yritä uudelleen',
  },
  protectedErrorPage: {
    title: 'Tapahtui virhe',
    description: 'Sivun lataamisessa tapahtui virhe.',
    tryAgain: 'Yritä uudelleen',
    goToDashboard: 'Siirry etusivulle',
  },
  nonSyncedKeys: {
    title: 'Synkronoimattomat avaimet',
    subtitle:
      'Avaimet, joiden synkronointi epäonnistui viimeisimmässä integraatioajossa.',
    lastIntegrationRun: 'Edellinen integraatioajo:',
    unableToLoad: 'Ei saatavilla',
    refresh: 'Päivitä',
    refreshed: 'Tiedot päivitetty',
    backToList: 'Takaisin kiinteistölistaan',
    realEstate: (name: string) => `Kiinteistö: ${name}`,
    keyCount: (count: number) => (count === 1 ? '1 avain' : `${count} avainta`),
    emptyTitle: 'Ei synkronointiongelmia',
    emptyDescription:
      'Kaikki avaimet on synkronoitu onnistuneesti iLOQin ja Efecten välillä.',
    loadFailedTitle: 'Synkronoimattomien avainten lataus epäonnistui',
    loadFailedDescription:
      'Tietojen hakeminen järjestelmästä ei onnistunut. Syynä voi olla tilapäinen yhteysongelma.',
    retry: 'Yritä uudelleen',
    loadFailedSupport: 'Jos ongelma jatkuu, ota yhteyttä tukeen.',
  },
  infoPanel: {
    title: 'Näin tämä toimii',
    items: [
      'Näkymä koskee avainten synkronointia iLOQista Efecteen. Listalla näkyvät iLOQ-avaimet, joille integraatio ei pystynyt luomaan tai päivittämään Efecten avainkorttia, koska avaimen haltijaa ei voitu tunnistaa.',
      'Integraatio ajetaan kerran vuorokaudessa.',
      'Kun kohdistat henkilön, rivi poistuu listalta heti ja avain synkronoidaan seuraavassa integraatioajossa. Jos synkronointi epäonnistuu edelleen, rivi palaa listalle ajon jälkeen.',
      'Rivit, joiden ongelma on korjaantunut muuta kautta (esimerkiksi iLOQissa), poistuvat listalta itsestään 3 päivän kuluessa.',
      'Integraatio ei luo Efecteen avainkortteja ulkopuolisille henkilöille.',
    ],
  },
  categories: {
    multiple_matching: {
      title: 'Useita samannimisiä henkilöitä',
      description:
        'Efectestä löytyi useita samannimisiä henkilöitä, eikä integraatio pystynyt päättelemään oikeaa. Vertaa henkilöiden tilaa, osastoa, toimipistettä ja katuosoitteita ja valitse oikea.',
      options: [] as string[],
    },
    no_matching: {
      title: 'Avaimen haltijaa ei löytynyt',
      description:
        'Efectestä ei löytynyt henkilöä iLOQ-henkilön nimellä, eikä avaimelle löytynyt vastaavaa ulkopuolisen henkilön avainkorttia. Valitse tilanteen mukaan:',
      options: [
        'Henkilö on Efectessä eri nimellä (esimerkiksi nimenmuutos tai eri kirjoitusasu): kohdista Efecten henkilöön.',
        'Henkilö on ulkopuolinen, ja hänellä on Efectessä avainkortti: rekisteröi ulkopuoliseksi.',
        'Henkilöllä ei pitäisi enää olla avainta: korjaa tilanne iLOQissa (palauta avain tai poista sen kulkualueet). Kohdistusta ei tarvita, ja rivi poistuu listalta itsestään 3 päivän kuluessa.',
      ],
    },
    outsider_without_key_card: {
      title: 'Ulkopuolinen ilman Efecten avainkorttia',
      description:
        'Henkilö on merkitty ulkopuoliseksi, mutta Efectestä ei löytynyt avaimelle vastaavaa ulkopuolisen henkilön avainkorttia. Integraatio ei luo Efecteen avainkortteja ulkopuolisille henkilöille, joten avain synkronoituu vasta, kun Efectessä on vastaava avainkortti. Luo avainkortti Efecteen tai poista avain iLOQista.',
      options: [] as string[],
    },
  },
  keyDetailsModal: {
    title: 'Avaimen tiedot',
    unsavedTitle: 'Tallentamattomia muutoksia',
    unsavedMessage:
      'Sinulla on tallentamattomia muutoksia. Haluatko varmasti sulkea ikkunan?',
  },
  syncInformation: {
    title: 'Synkronoinnin tiedot',
    timestamp: 'Aikaleima:',
    failureReason: 'Virheen syy:',
  },
  keyDetails: {
    title: 'Avain',
    description: 'Kuvaus:',
    realEstate: 'Kiinteistö:',
    state: 'Tila:',
    securityAccesses: 'Kulkualueet:',
    states: {
      0: 'Avain on suunnitteluvaiheessa',
      1: 'Avain on luovutettu henkilölle',
      2: 'Avain on piilotettu, eikä sitä näytetä oletuksena',
      3: 'Avain on poistettu, mutta säilyy järjestelmässä lokitusta varten',
      4: 'Avain on palautettu',
    } as Record<number, string>,
    unknownState: 'Tuntematon tila',
  },
  personInformation: {
    title: 'Henkilön tiedot (iLOQ)',
    firstName: 'Etunimi:',
    lastName: 'Sukunimi:',
    email: 'Sähköposti:',
    phone1: 'Puhelin 1:',
    phone2: 'Puhelin 2:',
    phone3: 'Puhelin 3:',
    workTitle: 'Työnimike:',
    companyName: 'Yritys:',
    address: 'Osoite:',
    zipCode: 'Postinumero:',
    postOffice: 'Postitoimipaikka:',
    country: 'Maa:',
    personCode: 'Henkilökoodi:',
    languageCode: 'Kielikoodi:',
    contactInfo: 'Yhteystiedot:',
    description: 'Kuvaus:',
    employmentEndDate: 'Työsuhteen päättymispäivä:',
    state: 'Tila:',
    externalCanEdit: 'Muokattavissa ulkoisesti:',
    externalPersonId: 'External Person ID:',
    yes: 'kyllä',
    no: 'ei',
  },
  matchingPersons: {
    title: 'Efectestä löytyneet samannimiset henkilöt',
    subtitle: 'Henkilöt on haettu etu- ja sukunimen perusteella.',
    loadFailed: 'Samannimisten henkilöiden lataus Efectestä epäonnistui',
    person: (index: number) => `Henkilö ${index}:`,
    fullName: 'Koko nimi:',
    email: 'Sähköposti:',
    mobile: 'Matkapuhelin:',
    phone: 'Puhelin:',
    jobTitle: 'Titteli:',
    department: 'Osasto:',
    office: 'Toimipiste:',
    efecteId: 'Efecte ID:',
    entityId: 'Entity ID:',
    status: 'Tila:',
    streetAddresses: 'Katuosoitteet:',
    select: 'Valitse',
    confirmTitle: 'Vahvista henkilön kohdistus',
    confirmMessage: (entityId: string, efecteId: string) =>
      `Haluatko varmasti kohdistaa avaimen tähän henkilöön?\n\nEntity ID: ${entityId}\nEfecte ID: ${efecteId}`,
  },
  forms: {
    matchOption: 'Kohdista Efecten henkilöön',
    outsiderOption: 'Rekisteröi ulkopuoliseksi',
    correctiveNote:
      'Korjaava toimenpide: kohdista henkilö Efecten henkilöön vain, jos hänet on aiemmin merkitty virheellisesti ulkopuoliseksi.',
    matchNote:
      'Kopioi Entity ID ja Efecte ID saman henkilön henkilökortilta Efectessä.',
    entityId: 'Entity ID',
    entityIdHelp: 'Henkilökortin Entity ID (numero)',
    entityIdPlaceholder: 'esim. 392450',
    entityIdInvalid: 'Entity ID:ssä saa olla vain numeroita (vähintään 6)',
    efecteId: 'Efecte ID',
    efecteIdHelp: 'Henkilökortin Efecte ID, muotoa PER-00000000',
    efecteIdPlaceholder: 'esim. PER-00028166',
    efecteIdInvalid: 'Efecte ID:n on oltava muotoa PER-XXXXXXXX (8 numeroa)',
    matchSubmit: 'Kohdista henkilö',
    outsiderNote:
      'Käytä tätä vain, jos Efectessä on jo tälle avaimelle ulkopuolisen henkilön avainkortti. Integraatio ei luo Efecteen avainkortteja ulkopuolisille henkilöille, vaan yhdistää iLOQ-avaimen olemassa olevaan korttiin. Kirjoita nimi ja sähköposti täsmälleen kuten ne ovat Efecten avainkortilla. Älä käytä tätä Efecten henkilöille.',
    outsiderName: 'Nimi',
    outsiderNamePlaceholder: 'Kirjoita koko nimi',
    outsiderEmail: 'Sähköposti',
    outsiderEmailHelp: 'Sähköposti Efecten avainkortilla',
    outsiderEmailPlaceholder: 'Kirjoita sähköpostiosoite',
    emailInvalid: 'Anna kelvollinen sähköpostiosoite',
    outsiderSubmit: 'Rekisteröi ulkopuoliseksi',
    confirmMatchTitle: 'Vahvista henkilön kohdistus',
    confirmMatchMessage: (entityId: string, efecteId: string) =>
      `Haluatko varmasti kohdistaa avaimen tähän henkilöön?\n\nEntity ID: ${entityId}\nEfecte ID: ${efecteId}\n\nVarmista, että Entity ID ja Efecte ID ovat saman henkilön henkilökortilta.`,
    confirmOutsiderTitle: 'Vahvista rekisteröinti ulkopuoliseksi',
    confirmOutsiderMessage: (name: string, email: string) =>
      `Haluatko varmasti rekisteröidä henkilön ulkopuoliseksi?\n\nNimi: ${name}\nSähköposti: ${email}\n\nAvain synkronoituu vain, jos Efectessä on avainkortti tällä nimellä ja sähköpostilla.`,
  },
  toasts: {
    matchSaved:
      'Kohdistus tallennettu. Avain synkronoidaan seuraavassa integraatioajossa. Jos synkronointi epäonnistuu, avain palaa listalle.',
    outsiderSaved:
      'Rekisteröinti tallennettu. Avain synkronoidaan seuraavassa integraatioajossa. Jos synkronointi epäonnistuu, avain palaa listalle.',
    customerCodeMissing:
      'Tätä riviä ei voi vielä käsitellä. Yritä uudelleen seuraavan integraatioajon jälkeen.',
    saveFailed:
      'Tallennus epäonnistui. Yritä hetken kuluttua uudelleen. Jos virhe toistuu, ota yhteyttä tukeen.',
  },
}

export type Dictionary = typeof fi

const en: Dictionary = {
  common: {
    appName: 'Efecte-iLOQ Integration',
    appDescription: 'Management interface for the Efecte-iLOQ integration',
    loading: 'Loading...',
    cancel: 'Cancel',
    confirm: 'Confirm',
    confirming: 'Confirming...',
    close: 'Close',
    dateTimeSeparator: 'at',
  },
  languageSwitcher: {
    label: 'Language',
    fi: 'Suomi',
    en: 'English',
  },
  nav: {
    dashboard: 'Dashboard',
    nonSyncedKeys: 'Non-synced keys',
  },
  login: {
    subtitle: 'Sign in to access the management interface',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    invalidCredentials: 'Invalid username or password',
    loginError: 'An error occurred during login',
  },
  dashboard: {
    title: 'Efecte-iLOQ Integration Dashboard',
    description:
      'This is the dashboard of the Efecte-iLOQ integration management interface. Additional features might be added in future stages.',
  },
  errorPage: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    errorId: (digest: string) => `Error ID: ${digest}`,
    tryAgain: 'Try again',
  },
  protectedErrorPage: {
    title: 'An error occurred',
    description: 'We encountered an issue while loading this page.',
    tryAgain: 'Try again',
    goToDashboard: 'Go to dashboard',
  },
  nonSyncedKeys: {
    title: 'Non-synced keys',
    subtitle: 'Keys that failed to synchronize in the last integration run.',
    lastIntegrationRun: 'Last integration run:',
    unableToLoad: 'Unable to load',
    refresh: 'Refresh',
    refreshed: 'Data refreshed',
    backToList: 'Back to real estate list',
    realEstate: (name: string) => `Real estate: ${name}`,
    keyCount: (count: number) => (count === 1 ? '1 key' : `${count} keys`),
    emptyTitle: 'No synchronization issues',
    emptyDescription:
      'All keys have been successfully synchronized between iLOQ and Efecte.',
    loadFailedTitle: 'Failed to load non-synced keys',
    loadFailedDescription:
      'Unable to retrieve data from the system. This may be due to a temporary connection issue.',
    retry: 'Retry',
    loadFailedSupport: 'If the problem persists, please contact support.',
  },
  infoPanel: {
    title: 'How this works',
    items: [
      'This view concerns the synchronization of keys from iLOQ to Efecte. The list shows iLOQ keys for which the integration could not create or update an Efecte key card, because the key holder could not be identified.',
      'The integration runs once a day.',
      'When you match a person, the row is removed from the list immediately and the key is synchronized in the next integration run. If the synchronization still fails, the row returns to the list after the run.',
      'Rows whose issue has been resolved by other means (for example in iLOQ) are removed from the list automatically within 3 days.',
      'The integration does not create Efecte key cards for outsiders.',
    ],
  },
  categories: {
    multiple_matching: {
      title: 'Multiple persons with the same name',
      description:
        'Several persons with the same name were found in Efecte, and the integration could not determine the correct one. Compare the persons’ status, department, office and street addresses, and select the correct person.',
      options: [],
    },
    no_matching: {
      title: 'Key holder not found',
      description:
        'No person with the iLOQ person’s name was found in Efecte, and no matching outsider key card was found for the key. Choose according to the situation:',
      options: [
        'The person has a different name in Efecte (for example a name change or a different spelling): match with the Efecte person.',
        'The person is an outsider with a key card in Efecte: register as outsider.',
        'The person should no longer have the key: fix the situation in iLOQ (return the key or remove its security accesses). No matching is needed, and the row is removed from the list automatically within 3 days.',
      ],
    },
    outsider_without_key_card: {
      title: 'Outsider without an Efecte key card',
      description:
        'The person has been registered as an outsider, but no matching outsider key card was found in Efecte for the key. The integration does not create Efecte key cards for outsiders, so the key is synchronized only once a matching key card exists in Efecte. Create the key card in Efecte or remove the key in iLOQ.',
      options: [],
    },
  },
  keyDetailsModal: {
    title: 'Key details',
    unsavedTitle: 'Unsaved changes',
    unsavedMessage: 'You have unsaved changes. Are you sure you want to close?',
  },
  syncInformation: {
    title: 'Synchronization information',
    timestamp: 'Timestamp:',
    failureReason: 'Failure reason:',
  },
  keyDetails: {
    title: 'Key',
    description: 'Description:',
    realEstate: 'Real estate:',
    state: 'State:',
    securityAccesses: 'Security accesses:',
    states: {
      0: 'Key is in planning state',
      1: 'Key is handed over to a person',
      2: 'Key is hidden and is not displayed by default',
      3: 'Key is deleted but remains in the system for logging purposes',
      4: 'Key is returned',
    },
    unknownState: 'Unknown state',
  },
  personInformation: {
    title: 'Person information (iLOQ)',
    firstName: 'First name:',
    lastName: 'Last name:',
    email: 'Email:',
    phone1: 'Phone 1:',
    phone2: 'Phone 2:',
    phone3: 'Phone 3:',
    workTitle: 'Work title:',
    companyName: 'Company name:',
    address: 'Address:',
    zipCode: 'Zip code:',
    postOffice: 'Post office:',
    country: 'Country:',
    personCode: 'Person code:',
    languageCode: 'Language code:',
    contactInfo: 'Contact info:',
    description: 'Description:',
    employmentEndDate: 'Employment end date:',
    state: 'State:',
    externalCanEdit: 'External can edit:',
    externalPersonId: 'External Person ID:',
    yes: 'yes',
    no: 'no',
  },
  matchingPersons: {
    title: 'Persons with the same name found in Efecte',
    subtitle: 'The persons were found based on first name and last name.',
    loadFailed: 'Unable to load matching persons from Efecte',
    person: (index: number) => `Person ${index}:`,
    fullName: 'Full name:',
    email: 'Email:',
    mobile: 'Mobile:',
    phone: 'Phone:',
    jobTitle: 'Title:',
    department: 'Department:',
    office: 'Office:',
    efecteId: 'Efecte ID:',
    entityId: 'Entity ID:',
    status: 'Status:',
    streetAddresses: 'Street addresses:',
    select: 'Select',
    confirmTitle: 'Confirm person matching',
    confirmMessage: (entityId: string, efecteId: string) =>
      `Are you sure you want to match the key with this person?\n\nEntity ID: ${entityId}\nEfecte ID: ${efecteId}`,
  },
  forms: {
    matchOption: 'Match with Efecte person',
    outsiderOption: 'Register as outsider',
    correctiveNote:
      'Corrective action: match the person with an Efecte person only if the person was earlier registered as an outsider by mistake.',
    matchNote:
      'Copy the Entity ID and the Efecte ID from the same person card in Efecte.',
    entityId: 'Entity ID',
    entityIdHelp: 'Entity ID of the person card (number)',
    entityIdPlaceholder: 'e.g. 392450',
    entityIdInvalid: 'Entity ID must contain only numbers (minimum 6 digits)',
    efecteId: 'Efecte ID',
    efecteIdHelp: 'Efecte ID of the person card, in format PER-00000000',
    efecteIdPlaceholder: 'e.g. PER-00028166',
    efecteIdInvalid: 'Efecte ID must be in format PER-XXXXXXXX (8 digits)',
    matchSubmit: 'Match person',
    outsiderNote:
      'Use this only if an outsider key card for this key already exists in Efecte. The integration does not create Efecte key cards for outsiders, it links the iLOQ key to the existing card. Enter the name and email exactly as they are on the Efecte key card. Do not use this for Efecte persons.',
    outsiderName: 'Name',
    outsiderNamePlaceholder: 'Enter full name',
    outsiderEmail: 'Email',
    outsiderEmailHelp: 'Email on the Efecte key card',
    outsiderEmailPlaceholder: 'Enter email address',
    emailInvalid: 'Please enter a valid email address',
    outsiderSubmit: 'Register as outsider',
    confirmMatchTitle: 'Confirm person matching',
    confirmMatchMessage: (entityId: string, efecteId: string) =>
      `Are you sure you want to match the key with this person?\n\nEntity ID: ${entityId}\nEfecte ID: ${efecteId}\n\nMake sure the Entity ID and the Efecte ID are from the same person card.`,
    confirmOutsiderTitle: 'Confirm outsider registration',
    confirmOutsiderMessage: (name: string, email: string) =>
      `Are you sure you want to register this person as an outsider?\n\nName: ${name}\nEmail: ${email}\n\nThe key is synchronized only if Efecte has a key card with this name and email.`,
  },
  toasts: {
    matchSaved:
      'Matching saved. The key will be synchronized in the next integration run. If the synchronization fails, the key returns to the list.',
    outsiderSaved:
      'Registration saved. The key will be synchronized in the next integration run. If the synchronization fails, the key returns to the list.',
    customerCodeMissing:
      'This row cannot be processed yet. Please try again after the next integration run.',
    saveFailed:
      'Saving failed. Please try again in a moment. If the error persists, contact support.',
  },
}

export const dictionaries: Record<Language, Dictionary> = { fi, en }

export function getDictionary(language: Language): Dictionary {
  return dictionaries[language]
}
