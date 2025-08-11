'use client'

import { getDictionary } from '@/i18n/dictionaries'
import { CourseMaterial } from '@/payload-types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'

interface MaterialNavigationProps {
  currentMaterial: CourseMaterial
  materials: CourseMaterial[]
  locale: 'nl' | 'de'
  filters: {
    searchQuery: string
    selectedTypes: string[]
    selectedSchoolTypes: string[]
    selectedCompetences: string[]
    selectedTopics: string[]
    selectedLanguages: string[]
  }
}

export function MaterialNavigation({
  currentMaterial,
  materials,
  locale,
  filters,
}: MaterialNavigationProps) {
  const router = useRouter()
  const dict = getDictionary(locale)
  const filteredMaterials = useMemo(() => {
    const query = filters.searchQuery.trim().toLowerCase()

    return materials.filter((m) => {
      const title = (locale === 'de' ? m.title_de : m.title_nl) || m.title_de || ''
      const matchesQuery = query === '' || title.toLowerCase().includes(query)

      const matchesLanguage =
        filters.selectedLanguages.length === 0 ||
        (Array.isArray(m.language) &&
          m.language.some((l) => filters.selectedLanguages.includes(l as string)))

      const matchesType =
        filters.selectedTypes.length === 0 ||
        (Array.isArray(m.materialTypes) &&
          m.materialTypes.some((t) => {
            if (typeof t === 'string') return filters.selectedTypes.includes(t)
            return t && 'id' in t && filters.selectedTypes.includes(String((t as any).id))
          }))

      const matchesSchoolType =
        filters.selectedSchoolTypes.length === 0 ||
        (() => {
          const st = m.schoolType
          if (!st) return false
          if (typeof st === 'string') return filters.selectedSchoolTypes.includes(st)
          return filters.selectedSchoolTypes.includes(String((st as any).id))
        })()

      const matchesCompetences =
        filters.selectedCompetences.length === 0 ||
        (Array.isArray(m.competences) &&
          m.competences.some((c) => {
            if (typeof c === 'string') return filters.selectedCompetences.includes(c)
            return c && 'id' in c && filters.selectedCompetences.includes(String((c as any).id))
          }))

      const matchesTopics =
        filters.selectedTopics.length === 0 ||
        (Array.isArray(m.topics) &&
          m.topics.some((t) => {
            if (typeof t === 'string') return filters.selectedTopics.includes(t)
            return t && 'id' in t && filters.selectedTopics.includes(String((t as any).id))
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
  }, [materials, filters, locale])

  const currentIndex = filteredMaterials.findIndex((m) => m.id === currentMaterial.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < filteredMaterials.length - 1

  const buildMaterialUrl = (material: CourseMaterial) => {
    const slug = material.slug || `id:${material.id}`
    const baseUrl = `/${locale}/lesmateriaal/${slug}`

    const params = new URLSearchParams()

    if (filters.searchQuery) params.set('q', filters.searchQuery)
    if (filters.selectedTypes.length > 0) params.set('types', filters.selectedTypes.join(','))
    if (filters.selectedSchoolTypes.length > 0)
      params.set('schoolTypes', filters.selectedSchoolTypes.join(','))
    if (filters.selectedCompetences.length > 0)
      params.set('competences', filters.selectedCompetences.join(','))
    if (filters.selectedTopics.length > 0) params.set('topics', filters.selectedTopics.join(','))
    if (filters.selectedLanguages.length > 0)
      params.set('langs', filters.selectedLanguages.join(','))

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious) {
        event.preventDefault()
        const previousMaterial = filteredMaterials[currentIndex - 1]
        const url = buildMaterialUrl(previousMaterial)
        router.push(url)
      } else if (event.key === 'ArrowRight' && hasNext) {
        event.preventDefault()
        const nextMaterial = filteredMaterials[currentIndex + 1]
        const url = buildMaterialUrl(nextMaterial)
        router.push(url)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, filteredMaterials, hasPrevious, hasNext, router])

  if (filteredMaterials.length <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-3">
      <div>
        <Link
          href={`/${locale}?${new URLSearchParams({
            ...(filters.searchQuery && { q: filters.searchQuery }),
            ...(filters.selectedTypes.length > 0 && { types: filters.selectedTypes.join(',') }),
            ...(filters.selectedSchoolTypes.length > 0 && {
              schoolTypes: filters.selectedSchoolTypes.join(','),
            }),
            ...(filters.selectedCompetences.length > 0 && {
              competences: filters.selectedCompetences.join(','),
            }),
            ...(filters.selectedTopics.length > 0 && {
              topics: filters.selectedTopics.join(','),
            }),
            ...(filters.selectedLanguages.length > 0 && {
              langs: filters.selectedLanguages.join(','),
            }),
          }).toString()}`}
          // className="text-sm text-blue-600 hover:underline"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
        >
          {dict.detailBackToOverview}
        </Link>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-sm text-gray-500">
          {locale === 'de'
            ? `${currentIndex + 1} von ${filteredMaterials.length}`
            : `${currentIndex + 1} van ${filteredMaterials.length}`}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {hasPrevious ? (
              <Link
                href={buildMaterialUrl(filteredMaterials[currentIndex - 1])}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {locale === 'de' ? 'Zurück' : 'Vorige'}
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-300 shadow-sm hover:bg-gray-50 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                {locale === 'de' ? 'Zurück' : 'Vorige'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasNext ? (
              <Link
                href={buildMaterialUrl(filteredMaterials[currentIndex + 1])}
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50"
              >
                {locale === 'de' ? 'Weiter' : 'Volgende'}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-300 shadow-sm hover:bg-gray-50 pointer-events-none">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
                {locale === 'de' ? 'Weiter' : 'Volgende'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
