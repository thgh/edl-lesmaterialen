/**
 * Shared filter and sort logic for course materials.
 * Used by both SSR (page) and client (MaterialsExplorer).
 */

export type MaterialLike = {
  id: string
  title_nl?: string | null
  title_de?: string | null
  description_nl?: string | null
  description_de?: string | null
  language?: ('nl' | 'de' | 'en')[] | null
  materialTypes?: (string | { id: string })[] | null
  schoolTypes?: (string | { id: string })[] | null
  competences?: (string | { id: string })[] | null
  topics?: (string | { id: string; title_nl?: string | null; title_de?: string | null })[] | null
  cefr?: string[] | null
  featured?: boolean | null
  createdAt?: string | null
}

export type FilterParams = {
  searchQuery: string
  selectedTypes: string[]
  selectedSchoolTypes: string[]
  selectedCompetences: string[]
  selectedTopics: string[]
  selectedLanguages: string[]
  selectedCefrLevels: string[]
}

const normalizeText = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const matchesId = (item: string | { id: string } | null | undefined, ids: string[]): boolean => {
  if (!item) return false
  const id = typeof item === 'string' ? item : String(item.id)
  return ids.includes(id)
}

export function filterAndSortMaterials<T extends MaterialLike>(
  materials: T[],
  filters: FilterParams,
  lang: 'nl' | 'de',
): T[] {
  const {
    searchQuery,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    selectedLanguages,
    selectedCefrLevels,
  } = filters

  const query = searchQuery.trim()
  const queryWords = normalizeText(query)
    .split(/\s+/)
    .filter((word) => word.length > 0)

  const filtered = materials.filter((m) => {
    const title =
      (lang === 'de' ? m.title_de : m.title_nl) || (lang === 'de' ? m.title_nl : m.title_de) || ''
    const description =
      (lang === 'de' ? m.description_de : m.description_nl) ||
      (lang === 'de' ? m.description_nl : m.description_de) ||
      ''
    const primarySearchText = normalizeText(title + ' ' + description)

    const topicTitles = Array.isArray(m.topics)
      ? m.topics
          .map((t) => {
            if (typeof t === 'string') return ''
            const topic = t as { title_nl?: string | null; title_de?: string | null }
            return (
              (lang === 'de' ? topic.title_de : topic.title_nl) ||
              topic.title_nl ||
              topic.title_de ||
              ''
            )
          })
          .join(' ')
      : ''
    const topicSearchText = normalizeText(topicTitles)

    const matchesPrimary = query === '' || queryWords.every((word) => primarySearchText.includes(word))
    const matchesQueryInTopicTitles =
      query === '' || queryWords.every((word) => topicSearchText.includes(word))
    const matchesQuery = matchesPrimary || matchesQueryInTopicTitles

    const matchesLanguage =
      selectedLanguages.length === 0 ||
      (Array.isArray(m.language) &&
        m.language.some((l) => selectedLanguages.includes(l as string)))
    const matchesType =
      selectedTypes.length === 0 ||
      (Array.isArray(m.materialTypes) &&
        m.materialTypes.some((t) => matchesId(t, selectedTypes)))
    const matchesSchoolType =
      selectedSchoolTypes.length === 0 ||
      (Array.isArray(m.schoolTypes) &&
        m.schoolTypes.some((st) => matchesId(st, selectedSchoolTypes)))
    const matchesCompetences =
      selectedCompetences.length === 0 ||
      (Array.isArray(m.competences) &&
        m.competences.some((c) => matchesId(c, selectedCompetences)))
    const matchesTopics =
      selectedTopics.length === 0 ||
      (Array.isArray(m.topics) && m.topics.some((t) => matchesId(t, selectedTopics)))
    const matchesCefr =
      selectedCefrLevels.length === 0 ||
      (Array.isArray(m.cefr) && m.cefr.some((level) => selectedCefrLevels.includes(level)))

    return (
      matchesQuery &&
      matchesLanguage &&
      matchesType &&
      matchesSchoolType &&
      matchesCompetences &&
      matchesTopics &&
      matchesCefr
    )
  })

  return filtered.sort((a, b) => {
    const aFeatured = (a as any).featured === true ? 1 : 0
    const bFeatured = (b as any).featured === true ? 1 : 0
    if (aFeatured !== bFeatured) return bFeatured - aFeatured

    if (query !== '') {
      const aTitle =
        (lang === 'de' ? a.title_de : a.title_nl) || (lang === 'de' ? a.title_nl : a.title_de) || ''
      const aDescription =
        (lang === 'de' ? a.description_de : a.description_nl) ||
        (lang === 'de' ? a.description_nl : a.description_de) ||
        ''
      const aPrimaryText = normalizeText(aTitle + ' ' + aDescription)

      const bTitle =
        (lang === 'de' ? b.title_de : b.title_nl) || (lang === 'de' ? b.title_nl : b.title_de) || ''
      const bDescription =
        (lang === 'de' ? b.description_de : b.description_nl) ||
        (lang === 'de' ? b.description_nl : b.description_de) ||
        ''
      const bPrimaryText = normalizeText(bTitle + ' ' + bDescription)

      const aMatchesPrimary = queryWords.every((word) => aPrimaryText.includes(word))
      const bMatchesPrimary = queryWords.every((word) => bPrimaryText.includes(word))
      if (aMatchesPrimary !== bMatchesPrimary) {
        return Number(bMatchesPrimary) - Number(aMatchesPrimary)
      }
    }

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return bDate - aDate
  })
}

function readList(raw: string | string[] | undefined): string[] {
  if (!raw) return []
  const str = Array.isArray(raw) ? raw.join(',') : raw
  return str
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
}

export function parseFiltersFromSearchParams(
  sp: URLSearchParams | Record<string, string | string[] | undefined>,
): FilterParams {
  const get = (key: string): string | string[] | undefined =>
    sp instanceof URLSearchParams ? sp.get(key) ?? undefined : sp[key]

  const q = get('q')
  return {
    searchQuery: (Array.isArray(q) ? q[0] : q) ?? '',
    selectedTypes: readList(get('types')),
    selectedSchoolTypes: readList(get('schoolTypes')),
    selectedCompetences: readList(get('competences')),
    selectedTopics: readList(get('topics')),
    selectedLanguages: readList(get('langs')),
    selectedCefrLevels: readList(get('cefr')),
  }
}
