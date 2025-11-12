'use client'

import { getDictionary } from '@/i18n/dictionaries'
import { CourseMaterial } from '@/payload-types'
import Link from 'next/link'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { CourseMaterialCard } from './CourseMaterialCard'
import { SearchAndFilters } from './SearchAndFilters'
import { Sidebar } from './Sidebar'
import { fetcher } from './fetcher'

// Helper function to convert words containing "@" into mailto links
function renderTextWithEmailLinks(text: string) {
  const words = text.split(/(\s+)/)
  return words.map((word, index) => {
    if (word.includes('@')) {
      return (
        <a
          key={index}
          href={`mailto:${word}`}
          className="text-blue-600 hover:underline whitespace-nowrap"
        >
          {word}
        </a>
      )
    }
    return <Fragment key={index}>{word}</Fragment>
  })
}

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
  cefrLabel: string
  languagesTitle: string
  languageDutchLabel: string
  languageGermanLabel: string
  showFilters: string
  hideFilters: string
}

interface MaterialsExplorerProps {
  materials: CourseMaterial[]
  materialTypes: MaterialType[]
  schoolTypes: MaterialType[]
  competences: MaterialType[]
  topics: MaterialType[]
  lang: 'nl' | 'de'
  labels: Labels
}

export function MaterialsExplorer({
  materials,
  materialTypes,
  schoolTypes,
  competences,
  topics,
  lang,
  labels,
}: MaterialsExplorerProps) {
  const dict = getDictionary(lang)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<string[]>([])
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [limit, setLimit] = useState(30)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const isAuthenticated = useSWR('/api/users/me', fetcher).data?.user

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
  ])

  const filtered = useMemo(() => {
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

    const filteredMaterials = materials.filter((m) => {
      // Concatenate title and description, then normalize
      const searchText = normalizeText(
        (m.title_nl || '') +
          ' ' +
          (m.description_nl || '') +
          ' ' +
          (m.title_de || '') +
          ' ' +
          (m.description_de || ''),
      )

      // Check if all query words are present
      const matchesQuery = query === '' || queryWords.every((word) => searchText.includes(word))
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => selectedLanguages.includes(l as string)))
      const matchesType =
        selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) => {
            if (typeof t === 'string') return selectedTypes.includes(t)
            return t && 'id' in t && selectedTypes.includes(String((t as any).id))
          }))
      const matchesSchoolType =
        selectedSchoolTypes.length === 0 ||
        (() => {
          const st = m.schoolType
          if (!st) return false
          if (typeof st === 'string') return selectedSchoolTypes.includes(st)
          return selectedSchoolTypes.includes(String((st as any).id))
        })()
      const matchesCompetences =
        selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) => {
            if (typeof c === 'string') return selectedCompetences.includes(c)
            return c && 'id' in c && selectedCompetences.includes(String((c as any).id))
          }))
      const matchesTopics =
        selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) => {
            if (typeof t === 'string') return selectedTopics.includes(t)
            return t && 'id' in t && selectedTopics.includes(String((t as any).id))
          }))
      return (
        matchesQuery &&
        matchesLanguage &&
        matchesType &&
        matchesSchoolType &&
        matchesCompetences &&
        matchesTopics
      )
    })

    // Sort: featured first, then by createdAt (newest first)
    return filteredMaterials.sort((a, b) => {
      // First sort by featured (featured items first)
      const aFeatured = (a as any).featured === true ? 1 : 0
      const bFeatured = (b as any).featured === true ? 1 : 0
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured
      }
      // Then sort by createdAt (newest first)
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
  }, [
    materials,
    searchQuery,
    selectedLanguages,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
  ])

  const visibleMaterials = filtered.slice(0, limit)

  // Compute counts per taxonomy based on current search query but before applying that taxonomy itself
  const { typeCounts, schoolTypeCounts, competenceCounts, topicCounts, languageCounts } =
    useMemo(() => {
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

        // Concatenate title and description, then normalize
        const searchText = normalizeText(
          (m.title_nl || '') +
            ' ' +
            (m.description_nl || '') +
            ' ' +
            (m.title_de || '') +
            ' ' +
            (m.description_de || ''),
        )

        // Check if all query words are present
        return queryWords.every((word) => searchText.includes(word))
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
          (() => {
            const st = m.schoolType
            if (!st) return false
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return selectedSchoolTypes.includes(String((st as any).id))
          })()

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

        return (
          matchesQuery(m) && matchesType && matchesSchoolType && matchesCompetences && matchesTopics
        )
      }

      const matchesExceptTypes = (m: CourseMaterial) => {
        // school type filter
        const matchesSchoolType =
          selectedSchoolTypes.length === 0 ||
          (() => {
            const st = m.schoolType
            if (!st) return false
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return selectedSchoolTypes.includes(String((st as any).id))
          })()

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

        return matchesQuery(m) && matchesSchoolType && matchesCompetences && matchesTopics
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

        return matchesQuery(m) && matchesType && matchesCompetences && matchesTopics
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
          (() => {
            const st = m.schoolType
            if (!st) return false
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return selectedSchoolTypes.includes(String((st as any).id))
          })()

        const matchesTopics =
          selectedTopics.length === 0 ||
          (Array.isArray(m.topics) &&
            m.topics.some((t) =>
              typeof t === 'string'
                ? selectedTopics.includes(t)
                : t && 'id' in t && selectedTopics.includes(String((t as any).id)),
            ))

        return matchesQuery(m) && matchesType && matchesSchoolType && matchesTopics
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
          (() => {
            const st = m.schoolType
            if (!st) return false
            if (typeof st === 'string') return selectedSchoolTypes.includes(st)
            return selectedSchoolTypes.includes(String((st as any).id))
          })()

        const matchesCompetences =
          selectedCompetences.length === 0 ||
          (Array.isArray(m.competences) &&
            m.competences.some((c) =>
              typeof c === 'string'
                ? selectedCompetences.includes(c)
                : c && 'id' in c && selectedCompetences.includes(String((c as any).id)),
            ))

        return matchesQuery(m) && matchesType && matchesSchoolType && matchesCompetences
      }

      const typeCounts: Record<string, number> = {}
      const schoolTypeCounts: Record<string, number> = {}
      const competenceCounts: Record<string, number> = {}
      const topicCounts: Record<string, number> = {}
      const languageCounts: Record<string, number> = {}

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
          const st = m.schoolType
          if (st) {
            const id = typeof st === 'string' ? st : String((st as any).id)
            if (id) schoolTypeCounts[id] = (schoolTypeCounts[id] ?? 0) + 1
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
      }

      return { typeCounts, schoolTypeCounts, competenceCounts, topicCounts, languageCounts }
    }, [
      materials,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
    ])

  return (
    <div className="block md:flex">
      <Sidebar locale={lang}>
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
            searchQuery={searchQuery}
            selectedTypes={selectedTypes}
            selectedSchoolTypes={selectedSchoolTypes}
            selectedCompetences={selectedCompetences}
            selectedTopics={selectedTopics}
            selectedLanguages={selectedLanguages}
            onChange={({ query, types, schoolTypes, competences, topics, languages }) => {
              setSearchQuery(query)
              setSelectedTypes(types)
              setSelectedSchoolTypes(schoolTypes)
              setSelectedCompetences(competences)
              setSelectedTopics(topics)
              setSelectedLanguages(languages)
            }}
            labels={{
              searchTitle: labels.searchTitle,
              searchPlaceholder: labels.searchPlaceholder,
              materialTypesTitle: labels.materialTypesTitle,
              schoolTypesTitle: labels.schoolTypesTitle,
              competencesTitle: labels.competencesTitle,
              topicsTitle: labels.topicsTitle,
              languagesTitle: labels.languagesTitle,
              languageDutchLabel: labels.languageDutchLabel,
              languageGermanLabel: labels.languageGermanLabel,
            }}
            typeCounts={typeCounts}
            schoolTypeCounts={schoolTypeCounts}
            competenceCounts={competenceCounts}
            topicCounts={topicCounts}
            languageCounts={languageCounts}
            locale={lang}
          />
        </div>
      </Sidebar>
      <main className="px-4 py-6 sm:p-6 lg:p-8">
        {/* Admin button for authenticated users */}
        {isAuthenticated && (
          <Link
            href={`/admin`}
            className="float-right text-sm items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 hidden md:inline-flex"
          >
            {lang === 'de' ? 'Beheren' : 'Beheren'}
          </Link>
        )}
        <h1 className="pt-2 text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
          {dict.siteTitle}
        </h1>
        <p className="text-lg text-gray-600">{dict.siteTagline}</p>
        <div className="mb-8 text-sm text-gray-600">
          {filtered.length === 1
            ? dict.materialFound
            : dict.materialsFound.replace('{count}', filtered.length.toString())}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
          {visibleMaterials.map((material) => (
            <CourseMaterialCard
              key={material.id}
              material={material}
              locale={lang}
              cefrLabel={labels.cefrLabel}
              filters={{
                searchQuery,
                selectedTypes,
                selectedSchoolTypes,
                selectedCompetences,
                selectedTopics,
                selectedLanguages,
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
        {/* Footer with contact and disclaimer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-4">
            {renderTextWithEmailLinks(dict.contactText)}
          </div>
          <div className="text-xs text-gray-500">{dict.disclaimerText}</div>
        </div>
      </main>
    </div>
  )
}
