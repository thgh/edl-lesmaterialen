'use client'

import { useCallback, useMemo } from 'react'

interface MaterialType {
  id: string
  title_nl?: string
  title_de?: string
}

interface Labels {
  searchTitle: string
  searchPlaceholder: string
  materialTypesTitle: string
  schoolTypesTitle: string
  competencesTitle: string
  topicsTitle: string
  languagesTitle: string
  languageDutchLabel: string
  languageGermanLabel: string
}

interface SearchAndFiltersProps {
  materialTypes: MaterialType[]
  schoolTypes: MaterialType[]
  competences: MaterialType[]
  topics: MaterialType[]
  searchQuery: string
  selectedTypes: string[]
  selectedSchoolTypes: string[]
  selectedCompetences: string[]
  selectedTopics: string[]
  selectedLanguages: string[]
  onChange: (state: {
    query: string
    types: string[]
    schoolTypes: string[]
    competences: string[]
    topics: string[]
    languages: string[]
  }) => void
  labels: Labels
  typeCounts: Record<string, number>
  schoolTypeCounts: Record<string, number>
  competenceCounts: Record<string, number>
  topicCounts: Record<string, number>
  languageCounts: Record<string, number>
  locale: 'nl' | 'de'
}

interface FilterSectionProps {
  title: string
  options: Array<{
    id: string
    title: string
    count: number
  }>
  selectedIds: string[]
  onToggle: (id: string) => void
}

function FilterSection({ title, options, selectedIds, onToggle }: FilterSectionProps) {
  if (!options.length) return null
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium text-gray-700">{title}</h3>
      <div className="rounded-md border border-gray-200 shadow-sm">
        {options.map((option) => (
          <label
            key={option.id}
            className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={() => onToggle(option.id)}
                className="size-4 rounded border-gray-300 text-black focus:ring-0"
              />
              <span className="text-sm text-gray-800 group-hover:underline">{option.title}</span>
            </span>
            <span className="text-xs text-gray-500">{option.count}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function SearchAndFilters({
  materialTypes,
  schoolTypes,
  competences,
  topics,
  searchQuery,
  selectedTypes,
  selectedSchoolTypes,
  selectedCompetences,
  selectedTopics,
  selectedLanguages,
  onChange,
  labels,
  typeCounts,
  schoolTypeCounts,
  competenceCounts,
  topicCounts,
  languageCounts,
  locale,
}: SearchAndFiltersProps) {
  const handleTypeToggle = useCallback(
    (typeId: string) => {
      const next = selectedTypes.includes(typeId)
        ? selectedTypes.filter((id) => id !== typeId)
        : [...selectedTypes, typeId]
      onChange({
        query: searchQuery,
        types: next,
        schoolTypes: selectedSchoolTypes,
        competences: selectedCompetences,
        topics: selectedTopics,
        languages: selectedLanguages,
      })
    },
    [
      onChange,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
    ],
  )

  const handleSchoolTypeToggle = useCallback(
    (id: string) => {
      const next = selectedSchoolTypes.includes(id)
        ? selectedSchoolTypes.filter((x) => x !== id)
        : [...selectedSchoolTypes, id]
      onChange({
        query: searchQuery,
        types: selectedTypes,
        schoolTypes: next,
        competences: selectedCompetences,
        topics: selectedTopics,
        languages: selectedLanguages,
      })
    },
    [
      onChange,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
    ],
  )

  const handleCompetenceToggle = useCallback(
    (id: string) => {
      const next = selectedCompetences.includes(id)
        ? selectedCompetences.filter((x) => x !== id)
        : [...selectedCompetences, id]
      onChange({
        query: searchQuery,
        types: selectedTypes,
        schoolTypes: selectedSchoolTypes,
        competences: next,
        topics: selectedTopics,
        languages: selectedLanguages,
      })
    },
    [
      onChange,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
    ],
  )

  const handleTopicToggle = useCallback(
    (id: string) => {
      const next = selectedTopics.includes(id)
        ? selectedTopics.filter((x) => x !== id)
        : [...selectedTopics, id]
      onChange({
        query: searchQuery,
        types: selectedTypes,
        schoolTypes: selectedSchoolTypes,
        competences: selectedCompetences,
        topics: next,
        languages: selectedLanguages,
      })
    },
    [
      onChange,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
    ],
  )

  // Helper function for localized title comparison
  const getLocalizedTitleForSort = (type: MaterialType) => {
    return (
      (locale === 'de' ? type.title_de : type.title_nl) ||
      type.title_de ||
      type.title_nl ||
      'Untitled'
    )
  }

  // Helper function to get localized title for display
  const getLocalizedTitle = (type: MaterialType) => {
    return (
      (locale === 'de' ? type.title_de : type.title_nl) ||
      type.title_de ||
      type.title_nl ||
      'Untitled'
    )
  }

  // Sorted copies of filter lists by highest count (desc), then by title (asc)
  const sortedMaterialTypes = useMemo(() => {
    return [...materialTypes].sort((a, b) => {
      const countA = typeCounts[a.id] ?? 0
      const countB = typeCounts[b.id] ?? 0
      if (countB !== countA) return countB - countA
      return getLocalizedTitleForSort(a).localeCompare(getLocalizedTitleForSort(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [materialTypes, typeCounts, locale])

  const visibleMaterialTypes = useMemo(() => {
    return sortedMaterialTypes.filter(
      (type) => (typeCounts[type.id] ?? 0) > 0 || selectedTypes.includes(type.id),
    )
  }, [sortedMaterialTypes, typeCounts, selectedTypes])

  const sortedSchoolTypes = useMemo(() => {
    return [...schoolTypes].sort((a, b) => {
      const countA = schoolTypeCounts[a.id] ?? 0
      const countB = schoolTypeCounts[b.id] ?? 0
      if (countB !== countA) return countB - countA
      return getLocalizedTitleForSort(a).localeCompare(getLocalizedTitleForSort(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [schoolTypes, schoolTypeCounts, locale])

  const visibleSchoolTypes = useMemo(() => {
    return sortedSchoolTypes.filter(
      (item) => (schoolTypeCounts[item.id] ?? 0) > 0 || selectedSchoolTypes.includes(item.id),
    )
  }, [sortedSchoolTypes, schoolTypeCounts, selectedSchoolTypes])

  const sortedCompetences = useMemo(() => {
    return [...competences].sort((a, b) => {
      const countA = competenceCounts[a.id] ?? 0
      const countB = competenceCounts[b.id] ?? 0
      if (countB !== countA) return countB - countA
      return getLocalizedTitleForSort(a).localeCompare(getLocalizedTitleForSort(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [competences, competenceCounts, locale])

  const visibleCompetences = useMemo(() => {
    return sortedCompetences.filter(
      (item) => (competenceCounts[item.id] ?? 0) > 0 || selectedCompetences.includes(item.id),
    )
  }, [sortedCompetences, competenceCounts, selectedCompetences])

  const sortedTopics = useMemo(() => {
    return [...topics].sort((a, b) => {
      const countA = topicCounts[a.id] ?? 0
      const countB = topicCounts[b.id] ?? 0
      if (countB !== countA) return countB - countA
      return getLocalizedTitleForSort(a).localeCompare(getLocalizedTitleForSort(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [topics, topicCounts, locale])

  const visibleTopics = useMemo(() => {
    return sortedTopics.filter(
      (item) => (topicCounts[item.id] ?? 0) > 0 || selectedTopics.includes(item.id),
    )
  }, [sortedTopics, topicCounts, selectedTopics])

  const handleLanguageToggle = useCallback(
    (code: 'nl' | 'de') => {
      const next = selectedLanguages.includes(code)
        ? selectedLanguages.filter((x) => x !== code)
        : [...selectedLanguages, code]
      onChange({
        query: searchQuery,
        types: selectedTypes,
        schoolTypes: selectedSchoolTypes,
        competences: selectedCompetences,
        topics: selectedTopics,
        languages: next,
      })
    },
    [
      onChange,
      searchQuery,
      selectedTypes,
      selectedSchoolTypes,
      selectedCompetences,
      selectedTopics,
      selectedLanguages,
    ],
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.searchTitle}</h3>
        <input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={(e) =>
            onChange({
              query: e.target.value,
              types: selectedTypes,
              schoolTypes: selectedSchoolTypes,
              competences: selectedCompetences,
              topics: selectedTopics,
              languages: selectedLanguages,
            })
          }
          className="w-full rounded-md bg-white border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none"
        />
      </div>

      <FilterSection
        title={labels.languagesTitle}
        options={[
          {
            id: 'nl',
            title: labels.languageDutchLabel,
            count: languageCounts['nl'] ?? 0,
          },
          {
            id: 'de',
            title: labels.languageGermanLabel,
            count: languageCounts['de'] ?? 0,
          },
        ].filter((option) => option.count > 0 || selectedLanguages.includes(option.id))}
        selectedIds={selectedLanguages}
        onToggle={(id) => handleLanguageToggle(id as 'nl' | 'de')}
      />

      <FilterSection
        title={labels.materialTypesTitle}
        options={visibleMaterialTypes.map((type) => ({
          id: type.id,
          title: getLocalizedTitle(type),
          count: typeCounts[type.id] ?? 0,
        }))}
        selectedIds={selectedTypes}
        onToggle={handleTypeToggle}
      />

      <FilterSection
        title={labels.schoolTypesTitle}
        options={visibleSchoolTypes.map((item) => ({
          id: item.id,
          title: getLocalizedTitle(item),
          count: schoolTypeCounts[item.id] ?? 0,
        }))}
        selectedIds={selectedSchoolTypes}
        onToggle={handleSchoolTypeToggle}
      />

      <FilterSection
        title={labels.competencesTitle}
        options={visibleCompetences.map((item) => ({
          id: item.id,
          title: getLocalizedTitle(item),
          count: competenceCounts[item.id] ?? 0,
        }))}
        selectedIds={selectedCompetences}
        onToggle={handleCompetenceToggle}
      />

      <FilterSection
        title={labels.topicsTitle}
        options={visibleTopics.map((item) => ({
          id: item.id,
          title: getLocalizedTitle(item),
          count: topicCounts[item.id] ?? 0,
        }))}
        selectedIds={selectedTopics}
        onToggle={handleTopicToggle}
      />
    </div>
  )
}
