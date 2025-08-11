'use client'

import { getDictionary } from '@/i18n/dictionaries'
import { CourseMaterial } from '@/payload-types'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CourseMaterialCard } from './CourseMaterialCard'
import { SearchAndFilters } from './SearchAndFilters'

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
  lang: locale,
  labels,
}: MaterialsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedSchoolTypes, setSelectedSchoolTypes] = useState<string[]>([])
  const [selectedCompetences, setSelectedCompetences] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [limit, setLimit] = useState(20)
  const [filtersOpen, setFiltersOpen] = useState(false)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const query = searchQuery.trim().toLowerCase()
    return materials.filter((m) => {
      const title = (locale === 'de' ? m.title_de : m.title_nl) || m.title_de || ''
      const matchesQuery = query === '' || title.toLowerCase().includes(query)
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
  }, [
    materials,
    searchQuery,
    selectedLanguages,
    selectedTypes,
    selectedSchoolTypes,
    selectedCompetences,
    selectedTopics,
    locale,
  ])

  const visibleMaterials = filtered.slice(0, limit)

  // Compute counts per taxonomy based on current search query but before applying that taxonomy itself
  const { typeCounts, schoolTypeCounts, competenceCounts, topicCounts, languageCounts } =
    useMemo(() => {
      const query = searchQuery.trim().toLowerCase()

      const matchesQuery = (m: CourseMaterial) => {
        const title = (locale === 'de' ? m.title_de : m.title_nl) || m.title_de || ''
        return query === '' || title.toLowerCase().includes(query)
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
      selectedLanguages,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
      locale,
    ])

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr] xl:grid-cols-[340px_1fr]">
      <aside className="pb-6 bg-gray-50 px-4 py-4 sm:p-6 lg:p-8">
        <div className="flex items-start justify-between mb-4 md:mb-10">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <img src="/assets/logo-edl.png" alt="Logo" width={128} height={104} />
            <span className="text-lg font-semibold sr-only">EDL Münster</span>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/nl"
              className={`rounded font-medium px-2 py-1 ${locale === 'nl' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
            >
              NL
            </Link>
            <Link
              href="/de"
              className={`rounded font-medium px-2 py-1 ${locale === 'de' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
            >
              DE
            </Link>
          </nav>
        </div>
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
          />
        </div>
      </aside>
      <main className="px-4 py-4 sm:px-6 lg:px-8">
        <div className="mb-3 text-sm text-gray-600">{filtered.length}</div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {visibleMaterials.map((material) => (
            <CourseMaterialCard
              key={material.id}
              material={material}
              locale={locale}
              cefrLabel={labels.cefrLabel}
            />
          ))}
        </div>
        <button
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          onClick={() => setLimit(limit * 5)}
        >
          {getDictionary(locale).loadMore}
        </button>
      </main>
    </div>
  )
}
