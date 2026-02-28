'use client'

import { CEFRLevels } from '@/collections/CEFRLevels'
import { getDictionary } from '@/i18n/dictionaries'
import { filterAndSortMaterials } from '@/lib/filterMaterials'
import { CourseMaterial } from '@/payload-types'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { CourseMaterialCard } from './CourseMaterialCard'
import { Footer } from './Footer'
import { Header } from './Header'
import { SearchAndFilters } from './SearchAndFilters'
import { Sidebar } from './Sidebar'
import { fetcher } from './fetcher'

type MaterialType = {
  id: string
  title_nl?: string
  title_de?: string
}

type Labels = {
  searchTitle: string
  searchPlaceholder: string
  materialTypesTitle: string
  schoolTypesTitle: string
  competencesTitle: string
  topicsTitle: string
  cefrTitle: string
  cefrLabel: string
  languagesTitle: string
  languageDutchLabel: string
  languageGermanLabel: string
  showFilters: string
  hideFilters: string
}

type TaxonomiesData = {
  materialTypes: MaterialType[]
  schoolTypes: MaterialType[]
  competences: MaterialType[]
  topics: MaterialType[]
}

const MATERIALS_SWR_KEY = '/api/materials'

interface MaterialsExplorerProps {
  initialMaterials: CourseMaterial[]
  lang: 'nl' | 'de'
  labels: Labels
}

const emptyTaxonomies: TaxonomiesData = {
  materialTypes: [],
  schoolTypes: [],
  competences: [],
  topics: [],
}

export function MaterialsExplorer({
  initialMaterials,
  lang,
  labels,
}: MaterialsExplorerProps) {
  const { data: materials } = useSWR<CourseMaterial[]>(MATERIALS_SWR_KEY, fetcher)

  const materialsForDisplay = materials ?? initialMaterials
  const hasFullMaterials = materials !== undefined

  const { data: taxonomies = emptyTaxonomies, isLoading: taxonomiesLoading } =
    useSWR<TaxonomiesData>('/api/taxonomies', fetcher)

  const { materialTypes, schoolTypes, competences, topics } = taxonomies
  const dict = getDictionary(lang)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<string[]>([])
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedCefrLevels, setSelectedCefrLevels] = useState<string[]>([])
  const [limit, setLimit] = useState(30)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const isAuthenticated = useSWR('/api/users/me', fetcher).data?.user

  // Validate and remove invalid selections from taxonomy lists (skip while loading)
  useEffect(() => {
    if (taxonomiesLoading) return

    const validLanguageValues = ['nl', 'de', 'en']
    const validCefrValues = CEFRLevels.map((level) => level.value)

    const validTypeIds = new Set(materialTypes.map((t) => t.id))
    const validSchoolTypeIds = new Set(schoolTypes.map((t) => t.id))
    const validCompetenceIds = new Set(competences.map((c) => c.id))
    const validTopicIds = new Set(topics.map((t) => t.id))

    // Filter out invalid selections
    const filteredTypes = selectedTypes.filter((id) => validTypeIds.has(id))
    const filteredSchoolTypes = selectedSchoolTypes.filter((id) => validSchoolTypeIds.has(id))
    const filteredCompetences = selectedCompetences.filter((id) => validCompetenceIds.has(id))
    const filteredTopics = selectedTopics.filter((id) => validTopicIds.has(id))
    const filteredLanguages = selectedLanguages.filter((lang) => validLanguageValues.includes(lang))
    const filteredCefrLevels = selectedCefrLevels.filter((level) => validCefrValues.includes(level))

    // Update state only if there are changes to avoid infinite loops
    // Compare arrays by checking if lengths differ or if any item differs
    const arraysEqual = (a: string[], b: string[]) =>
      a.length === b.length && a.every((val, idx) => val === b[idx])

    if (!arraysEqual(filteredTypes, selectedTypes)) {
      setSelectedTypes(filteredTypes)
    }
    if (!arraysEqual(filteredSchoolTypes, selectedSchoolTypes)) {
      setSelectedSchoolTypes(filteredSchoolTypes)
    }
    if (!arraysEqual(filteredCompetences, selectedCompetences)) {
      setSelectedCompetences(filteredCompetences)
    }
    if (!arraysEqual(filteredTopics, selectedTopics)) {
      setSelectedTopics(filteredTopics)
    }
    if (!arraysEqual(filteredLanguages, selectedLanguages)) {
      setSelectedLanguages(filteredLanguages)
    }
    if (!arraysEqual(filteredCefrLevels, selectedCefrLevels)) {
      setSelectedCefrLevels(filteredCefrLevels)
    }
  }, [
    taxonomiesLoading,
    materialTypes,
    schoolTypes,
    competences,
    topics,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    selectedLanguages,
    selectedCefrLevels,
  ])

  // Track last URL we intentionally pushed and an inactivity timer
  const lastPushedUrlRef = useRef<string | null>(null)
  const pushTimerRef = useRef<number | null>(null)

  // Helpers to read/write filters to URL without causing server re-renders
  const readFiltersFromUrl = () => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    const sp = url.searchParams
    const readList = (key: string): string[] => {
      const raw = sp.get(key)
      if (!raw) return []
      return raw
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
    }

    setSearchQuery(sp.get('q') ?? '')
    setSelectedTypes(readList('types'))
    setSelectedSchoolTypes(readList('schoolTypes'))
    setSelectedCompetences(readList('competences'))
    setSelectedTopics(readList('topics'))
    setSelectedLanguages(readList('langs'))
    setSelectedCefrLevels(readList('cefr'))
  }

  const buildUrlWithFilters = (): string => {
    const current = new URL(window.location.href)
    const sp = current.searchParams
    const setOrDelete = (key: string, value: string | string[]) => {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          sp.delete(key)
        } else {
          sp.set(key, value.join(','))
        }
      } else {
        if (!value || value.trim() === '') sp.delete(key)
        else sp.set(key, value)
      }
    }

    setOrDelete('q', searchQuery)
    setOrDelete('types', selectedTypes)
    setOrDelete('schoolTypes', selectedSchoolTypes)
    setOrDelete('competences', selectedCompetences)
    setOrDelete('topics', selectedTopics)
    setOrDelete('langs', selectedLanguages)
    setOrDelete('cefr', selectedCefrLevels)

    current.search = sp.toString()
    return current.toString()
  }

  // Initialize from URL and handle back/forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return
    lastPushedUrlRef.current = window.location.href
    readFiltersFromUrl()

    const onPopState = () => {
      readFiltersFromUrl()
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (pushTimerRef.current) {
        window.clearTimeout(pushTimerRef.current)
      }
    }
  }, [])

  // Sync URL on filter changes (replaceState immediately, debounce pushState for history)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const nextUrl = buildUrlWithFilters()
    // Do not cause server navigation; just update the URL bar
    window.history.replaceState(null, '', nextUrl)

    if (pushTimerRef.current) {
      window.clearTimeout(pushTimerRef.current)
    }

    pushTimerRef.current = window.setTimeout(() => {
      const finalUrl = buildUrlWithFilters()
      if (lastPushedUrlRef.current !== finalUrl) {
        window.history.pushState(null, '', finalUrl)
        lastPushedUrlRef.current = finalUrl
      }
    }, 5000)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    selectedLanguages,
    selectedCefrLevels,
  ])

  const filtered = useMemo(
    () =>
      filterAndSortMaterials(materialsForDisplay, {
        searchQuery,
        selectedTypes,
        selectedSchoolTypes,
        selectedCompetences,
        selectedTopics,
        selectedLanguages,
        selectedCefrLevels,
      }, lang),
    [
    materialsForDisplay,
    searchQuery,
    lang,
    selectedLanguages,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    selectedCefrLevels,
  ])

  const visibleMaterials = filtered.slice(0, limit)

  // Compute counts per taxonomy based on current search query but before applying that taxonomy itself
  const {
    typeCounts,
    schoolTypeCounts,
    competenceCounts,
    topicCounts,
    languageCounts,
    cefrCounts,
  } = useMemo(() => {
    if (!materials) {
      return {
        typeCounts: {},
        schoolTypeCounts: {},
        competenceCounts: {},
        topicCounts: {},
        languageCounts: {},
        cefrCounts: {},
      }
    }
    const query = searchQuery.trim()

    // Normalize text by removing accents and converting to lowercase
    const normalizeText = (text: string) => {
      return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics/accents
        .toLowerCase()
    }

    const normalizedQuery = normalizeText(query)
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0)

    const matchesQuery = (m: CourseMaterial) => {
      if (query === '') return true

      // Get title with fallback to other language
      const title =
        (lang === 'de' ? m.title_de : m.title_nl) || (lang === 'de' ? m.title_nl : m.title_de) || ''
      // Get description with fallback to other language
      const description =
        (lang === 'de' ? m.description_de : m.description_nl) ||
        (lang === 'de' ? m.description_nl : m.description_de) ||
        ''

      // Concatenate title and description, then normalize
      const primarySearchText = normalizeText(title + ' ' + description)

      // Extract topic titles for secondary search (lower priority) with fallback
      const topicTitles = Array.isArray(m.topics)
        ? m.topics
            .map((t) => {
              if (typeof t === 'string') return ''
              const topic = t as any
              const topicTitle =
                (lang === 'de' ? topic.title_de : topic.title_nl) ||
                (lang === 'de' ? topic.title_nl : topic.title_de) ||
                ''
              return topicTitle
            })
            .join(' ')
        : ''
      const topicSearchText = normalizeText(topicTitles)

      // Check if all query words are present in primary fields (title/description)
      const matchesPrimary = queryWords.every((word) => primarySearchText.includes(word))

      // If not matching primary, check topic titles (lower priority)
      const matchesQueryInTopicTitles = queryWords.every((word) => topicSearchText.includes(word))

      return matchesPrimary || matchesQueryInTopicTitles
    }

    const matchesExceptLanguages = (m: CourseMaterial) => {
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) =>
            typeof t === 'string'
              ? selectedTypes.includes(t)
              : t && 'id' in t && selectedTypes.includes(String((t as any).id)),
          ))

      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (Array.isArray(m.schoolTypes) &&
          m.schoolTypes.some((st) => {
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return st && 'id' in st && selectedSchoolTypes.includes(String((st as any).id))
          }))

      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) =>
            typeof c === 'string'
              ? selectedCompetences.includes(c)
              : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
          ))

      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) =>
            typeof t === 'string'
              ? selectedTopics.includes(t)
              : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
          ))

      const matchesCefr =
        selectedCefrLevels.length === 0 ||
        (Array.isArray(m.cefr) &&
          m.cefr.some((level) => selectedCefrLevels.includes(level as string)))

      return (
        matchesQuery(m) &&
        matchesType &&
        matchesSchoolType &&
        matchesCompetences &&
        matchesTopics &&
        matchesCefr
      )
    }

    const matchesExceptTypes = (m: CourseMaterial) => {
      // school type filter
      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (Array.isArray(m.schoolTypes) &&
          m.schoolTypes.some((st) => {
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return st && 'id' in st && selectedSchoolTypes.includes(String((st as any).id))
          }))

      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) =>
            typeof c === 'string'
              ? selectedCompetences.includes(c)
              : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
          ))

      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) =>
            typeof t === 'string'
              ? selectedTopics.includes(t)
              : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
          ))

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))

      const matchesCefr =
        selectedCefrLevels.length === 0 ||
        (Array.isArray(m.cefr) &&
          m.cefr.some((level) => selectedCefrLevels.includes(level as string)))

      return (
        matchesQuery(m) &&
        matchesSchoolType &&
        matchesCompetences &&
        matchesTopics &&
        matchesLanguage &&
        matchesCefr
      )
    }

    const matchesExceptSchoolType = (m: CourseMaterial) => {
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) =>
            typeof t === 'string'
              ? selectedTypes.includes(t)
              : t && 'id' in t && selectedTypes.includes(String((t as any).id)),
          ))

      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) =>
            typeof c === 'string'
              ? selectedCompetences.includes(c)
              : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
          ))

      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) =>
            typeof t === 'string'
              ? selectedTopics.includes(t)
              : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
          ))

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))

      const matchesCefr =
        selectedCefrLevels.length === 0 ||
        (Array.isArray(m.cefr) &&
          m.cefr.some((level) => selectedCefrLevels.includes(level as string)))

      return (
        matchesQuery(m) &&
        matchesType &&
        matchesCompetences &&
        matchesTopics &&
        matchesLanguage &&
        matchesCefr
      )
    }

    const matchesExceptCompetences = (m: CourseMaterial) => {
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) =>
            typeof t === 'string'
              ? selectedTypes.includes(t)
              : t && 'id' in t && selectedTypes.includes(String((t as any).id)),
          ))

      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (Array.isArray(m.schoolTypes) &&
          m.schoolTypes.some((st) => {
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return st && 'id' in st && selectedSchoolTypes.includes(String((st as any).id))
          }))

      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) =>
            typeof t === 'string'
              ? selectedTopics.includes(t)
              : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
          ))

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))

      const matchesCefr =
        selectedCefrLevels.length === 0 ||
        (Array.isArray(m.cefr) &&
          m.cefr.some((level) => selectedCefrLevels.includes(level as string)))

      return (
        matchesQuery(m) &&
        matchesType &&
        matchesSchoolType &&
        matchesTopics &&
        matchesLanguage &&
        matchesCefr
      )
    }

    const matchesExceptTopics = (m: CourseMaterial) => {
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) =>
            typeof t === 'string'
              ? selectedTypes.includes(t)
              : t && 'id' in t && selectedTypes.includes(String((t as any).id)),
          ))

      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (Array.isArray(m.schoolTypes) &&
          m.schoolTypes.some((st) => {
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return st && 'id' in st && selectedSchoolTypes.includes(String((st as any).id))
          }))

      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) =>
            typeof c === 'string'
              ? selectedCompetences.includes(c)
              : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
          ))

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))

      const matchesCefr =
        selectedCefrLevels.length === 0 ||
        (Array.isArray(m.cefr) &&
          m.cefr.some((level) => selectedCefrLevels.includes(level as string)))

      return (
        matchesQuery(m) &&
        matchesType &&
        matchesSchoolType &&
        matchesCompetences &&
        matchesLanguage &&
        matchesCefr
      )
    }

    const matchesExceptCefr = (m: CourseMaterial) => {
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) =>
            typeof t === 'string'
              ? selectedTypes.includes(t)
              : t && 'id' in t && selectedTypes.includes(String((t as any).id)),
          ))

      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (Array.isArray(m.schoolTypes) &&
          m.schoolTypes.some((st) => {
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return st && 'id' in st && selectedSchoolTypes.includes(String((st as any).id))
          }))

      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) =>
            typeof c === 'string'
              ? selectedCompetences.includes(c)
              : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
          ))

      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) =>
            typeof t === 'string'
              ? selectedTopics.includes(t)
              : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
          ))

      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))

      return (
        matchesQuery(m) &&
        matchesType &&
        matchesSchoolType &&
        matchesCompetences &&
        matchesTopics &&
        matchesLanguage
      )
    }

    const typeCounts: Record<string, number> = {}
    const schoolTypeCounts: Record<string, number> = {}
    const competenceCounts: Record<string, number> = {}
    const topicCounts: Record<string, number> = {}
    const languageCounts: Record<string, number> = {}
    const cefrCounts: Record<string, number> = {}

    // iterate once and increment relevant buckets when material matches the other filters
    for (const m of materials) {
      if (matchesExceptTypes(m)) {
        if (Array.isArray(m.materialTypes)) {
          for (const t of m.materialTypes) {
            const id = typeof t === 'string' ? t : String((t as any).id)
            if (id) typeCounts[id] = (typeCounts[id] ?? 0) + 1
          }
        }
      }

      if (matchesExceptSchoolType(m)) {
        const st = m.schoolTypes
        if (Array.isArray(st)) {
          for (const s of st) {
            const id = typeof s === 'string' ? s : String((s as any).id)
            if (id) schoolTypeCounts[id] = (schoolTypeCounts[id] ?? 0) + 1
          }
        }
      }

      if (matchesExceptCompetences(m)) {
        if (Array.isArray(m.competences)) {
          for (const c of m.competences) {
            const id = typeof c === 'string' ? c : String((c as any).id)
            if (id) competenceCounts[id] = (competenceCounts[id] ?? 0) + 1
          }
        }
      }

      if (matchesExceptTopics(m)) {
        if (Array.isArray(m.topics)) {
          for (const t of m.topics) {
            const id = typeof t === 'string' ? t : String((t as any).id)
            if (id) topicCounts[id] = (topicCounts[id] ?? 0) + 1
          }
        }
      }

      if (matchesExceptLanguages(m)) {
        if (Array.isArray(m.language)) {
          for (const l of m.language) {
            if (l === 'nl' || l === 'de') {
              const key = l as string
              languageCounts[key] = (languageCounts[key] ?? 0) + 1
            }
          }
        }
      }

      if (matchesExceptCefr(m)) {
        if (Array.isArray(m.cefr)) {
          for (const level of m.cefr) {
            if (level) {
              const key = level as string
              cefrCounts[key] = (cefrCounts[key] ?? 0) + 1
            }
          }
        }
      }
    }

    return {
      typeCounts,
      schoolTypeCounts,
      competenceCounts,
      topicCounts,
      languageCounts,
      cefrCounts,
    }
  }, [
    materials,
    searchQuery,
    lang,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    selectedLanguages,
    selectedCefrLevels,
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <Header locale={lang} />
      <div className="block md:flex flex-1">
        <Sidebar locale={lang}>
          {hasFullMaterials ? (
            <>
              <div className="md:hidden">
                <button
                  type="button"
                  aria-expanded={filtersOpen}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
                  onClick={() => setFiltersOpen((v) => !v)}
                >
                  {filtersOpen ? labels.hideFilters : labels.showFilters}
                </button>
              </div>

              <div className={`${filtersOpen ? 'block mt-4' : 'hidden'} md:block`}>
                <SearchAndFilters
              materialTypes={materialTypes}
              schoolTypes={schoolTypes}
              competences={competences}
              topics={topics}
              taxonomiesLoading={taxonomiesLoading}
              materialsLoading={!hasFullMaterials}
              searchQuery={searchQuery}
              selectedTypes={selectedTypes}
              selectedSchoolTypes={selectedSchoolTypes}
              selectedCompetences={selectedCompetences}
              selectedTopics={selectedTopics}
              selectedLanguages={selectedLanguages}
              selectedCefrLevels={selectedCefrLevels}
              onChange={({
                query,
                types,
                schoolTypes,
                competences,
                topics,
                languages,
                cefrLevels,
              }) => {
                setSearchQuery(query)
                setSelectedTypes(types)
                setSelectedSchoolTypes(schoolTypes)
                setSelectedCompetences(competences)
                setSelectedTopics(topics)
                setSelectedLanguages(languages)
                setSelectedCefrLevels(cefrLevels)
              }}
              labels={{
                searchTitle: labels.searchTitle,
                searchPlaceholder: labels.searchPlaceholder,
                materialTypesTitle: labels.materialTypesTitle,
                schoolTypesTitle: labels.schoolTypesTitle,
                competencesTitle: labels.competencesTitle,
                topicsTitle: labels.topicsTitle,
                cefrTitle: labels.cefrTitle,
                languagesTitle: labels.languagesTitle,
                languageDutchLabel: labels.languageDutchLabel,
                languageGermanLabel: labels.languageGermanLabel,
              }}
              typeCounts={hasFullMaterials ? typeCounts : {}}
              schoolTypeCounts={hasFullMaterials ? schoolTypeCounts : {}}
              competenceCounts={hasFullMaterials ? competenceCounts : {}}
              topicCounts={hasFullMaterials ? topicCounts : {}}
              languageCounts={hasFullMaterials ? languageCounts : {}}
              cefrCounts={hasFullMaterials ? cefrCounts : {}}
              locale={lang}
                />
              </div>
            </>
          ) : (
            <div className="w-full min-h-[200px] animate-pulse rounded-md bg-gray-100" aria-hidden />
          )}
        </Sidebar>
        <main className="px-4 py-6 sm:p-6 lg:p-8">
          {isAuthenticated && (
            <div className="float-right mb-4">
              <Link
                href={`/admin`}
                className="text-sm items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 hidden md:inline-flex"
              >
                {lang === 'de' ? 'Beheren' : 'Beheren'}
              </Link>
            </div>
          )}
          <div className="mb-8 text-sm text-gray-600 min-h-[1.25rem]">
            {hasFullMaterials
              ? filtered.length === 1
                ? dict.materialFound
                : dict.materialsFound.replace('{count}', filtered.length.toString())
              : '\u00A0'}
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
            {visibleMaterials.map((material) => (
              <CourseMaterialCard
                key={material.id}
                material={material}
                locale={lang}
                cefrLabel={labels.cefrLabel}
                taxonomies={{ materialTypes, schoolTypes, competences, topics }}
                filters={{
                  searchQuery,
                  selectedTypes,
                  selectedSchoolTypes,
                  selectedCompetences,
                  selectedTopics,
                  selectedLanguages,
                  selectedCefrLevels,
                }}
              />
            ))}
          </div>
          {limit < filtered.length && (
            <button
              className="mt-6 font-medium rounded-md bg-brand px-4 py-2 text-black hover:bg-brand-dark"
              onClick={() => setLimit(limit * 5)}
            >
              {dict.loadMore}
            </button>
          )}
        </main>
      </div>
      <Footer locale={lang} />
    </div>
  )
}
