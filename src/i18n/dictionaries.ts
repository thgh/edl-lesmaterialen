export type Locale = 'nl' | 'de'

const dictionaries = {
  nl: {
    siteTitle: 'Lesmaterialen',
    siteTagline: 'Lesmaterialen verzameld door de EDL Münster.',
    searchTitle: 'Wat zoek je?',
    searchPlaceholder: 'Zoeken op titel',
    materialTypesTitle: 'Materiaalsoorten',
    schoolTypesTitle: 'Schooltypes',
    competencesTitle: 'Competenties',
    topicsTitle: 'Onderwerpen',
    cefrLabel: 'ERK-niveau:',
    loadMore: 'Toon meer',
    languagesTitle: 'Taal',
    languageDutch: 'Nederlands',
    languageGerman: 'Duits',
    showFilters: 'Filters tonen',
    hideFilters: 'Filters verbergen',
  },
  de: {
    siteTitle: 'Unterrichtsmaterialien',
    siteTagline:
      'Unterrichtsmaterialien Zentrum für Niederlande-Studien (ZNS) van de Universiteit Münster.',
    searchTitle: 'Wonach suchst du?',
    searchPlaceholder: 'Nach Titel suchen',
    materialTypesTitle: 'Materialarten',
    schoolTypesTitle: 'Schularten',
    competencesTitle: 'Kompetenzen',
    topicsTitle: 'Themen',
    cefrLabel: 'GER-Niveau:',
    loadMore: 'Mehr anzeigen',
    languagesTitle: 'Sprache',
    languageDutch: 'Niederländisch',
    languageGerman: 'Deutsch',
    showFilters: 'Filter anzeigen',
    hideFilters: 'Filter ausblenden',
  },
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export function getDictionary(locale: string | null | undefined): Dictionary {
  if (locale === 'de') return dictionaries.de
  return dictionaries.nl
}
