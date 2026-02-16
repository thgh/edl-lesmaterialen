export type Locale = 'nl' | 'de'

const dictionaries = {
  nl: {
    siteTitle: 'Lesmaterialen',
    siteTagline: 'Lesmateriaal voor het Duits- en Nederlands onderwijs in de Euregio',
    searchTitle: 'Wat zoek je?',
    searchPlaceholder: 'Zoeken op titel',
    materialTypesTitle: 'Materiaalsoorten',
    schoolTypesTitle: 'Schooltypes',
    competencesTitle: 'Competenties',
    topicsTitle: 'Onderwerpen',
    cefrTitle: 'ERK-niveaus',
    cefrLabel: 'ERK-niveau:',
    loadMore: 'Toon meer',
    languagesTitle: 'Taal van de inhoud',
    languageDutch: 'Nederlands',
    languageGerman: 'Duits',
    showFilters: 'Filters tonen',
    hideFilters: 'Filters verbergen',
    detailBackToOverview: 'Terug naar overzicht',
    detailOpenWebsite: 'Open website',
    detailDownload: 'Download',
    detailExternalLinksTitle: 'Externe links',
    materialFound: '1 lesmateriaal gevonden',
    materialsFound: '{count} lesmaterialen gevonden',
    contactText:
      'Voor vragen, het melden van problemen of het voorstellen van nieuw materiaal, neem contact op met zns.sekretariat@uni-muenster.de. Zentrum für Niederlande-Studien, Alter Steinweg 6/7, 48143 Münster',
    disclaimerText:
      'Deze website is ontwikkeld binnen de Euregionale Doorlopende Leerlijn (EDL) en wordt beheerd door het Zentrum für Niederlande-Studien (ZNS). Het materiaal is deels eigen werk, deels afkomstig uit externe bronnen – eigen materiaal is als zodanig vermeld. Alle rechten berusten bij de auteurs. Gebruik uitsluitend voor educatieve doeleinden.',
    contactLabel: 'Contactgegevens',
    licenseLabel: 'Licentie',
  },
  de: {
    siteTitle: 'Unterrichtsmaterialien',
    siteTagline: 'Materialien für den Deutsch- und Niederländischunterricht in der Euregio',
    searchTitle: 'Wonach suchst du?',
    searchPlaceholder: 'Nach Titel suchen',
    materialTypesTitle: 'Materialarten',
    schoolTypesTitle: 'Schularten',
    competencesTitle: 'Kompetenzen',
    topicsTitle: 'Themen',
    cefrTitle: 'GER-Niveaus',
    cefrLabel: 'GER-Niveau:',
    loadMore: 'Mehr anzeigen',
    languagesTitle: 'Sprache',
    languageDutch: 'Niederländisch',
    languageGerman: 'Deutsch',
    showFilters: 'Filter anzeigen',
    hideFilters: 'Filter ausblenden',
    detailBackToOverview: 'Zurück zur Übersicht',
    detailOpenWebsite: 'Webseite öffnen',
    detailDownload: 'Herunterladen',
    detailExternalLinksTitle: 'Externe Links',
    materialFound: '1 Material gefunden',
    materialsFound: '{count} Materialen gefunden',
    contactText:
      'Bei Fragen, Problemen oder Vorschlägen für neues Material kontaktieren Sie bitte zns.sekretariat@uni-muenster.de. Zentrum für Niederlande-Studien, Alter Steinweg 6/7, 48143 Münster',
    disclaimerText:
      'Diese Website wurde im Rahmen der Euregionalen Bildungskette (EDL) erstellt und wird vom Zentrum für Niederlande-Studien (ZNS) betreut. Die Materialien stammen teils vom ZNS und EDL, teils aus externen Quellen – eigene Inhalte sind entsprechend gekennzeichnet. Alle Rechte liegen bei den jeweiligen Autor*innen. Nutzung nur zu Bildungszwecken.',
    contactLabel: 'Kontaktdaten',
    licenseLabel: 'Lizenz',
  },
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export function getDictionary(locale: string | null | undefined): Dictionary {
  if (locale === 'de') return dictionaries.de
  return dictionaries.nl
}
