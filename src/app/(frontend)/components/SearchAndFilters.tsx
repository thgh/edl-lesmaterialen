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

  const getTypeTitle = (type: MaterialType) => {
    return type.title_nl || type.title_de || 'Untitled'
  }

  // Sorted copies of filter lists by highest count (desc), then by title (asc)
  const sortedMaterialTypes = useMemo(() => {
    return [...materialTypes].sort((a, b) => {
      const countA = typeCounts[a.id] ?? 0
      const countB = typeCounts[b.id] ?? 0
      if (countB !== countA) return countB - countA
      return getTypeTitle(a).localeCompare(getTypeTitle(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [materialTypes, typeCounts])

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
      return getTypeTitle(a).localeCompare(getTypeTitle(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [schoolTypes, schoolTypeCounts])

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
      return getTypeTitle(a).localeCompare(getTypeTitle(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [competences, competenceCounts])

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
      return getTypeTitle(a).localeCompare(getTypeTitle(b), undefined, {
        sensitivity: 'base',
      })
    })
  }, [topics, topicCounts])

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

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.languagesTitle}</h3>
        <div className="rounded-md border border-gray-200 shadow-sm">
          {(languageCounts['nl'] ?? 0) > 0 || selectedLanguages.includes('nl') ? (
            <label className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes('nl')}
                  onChange={() => handleLanguageToggle('nl')}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {labels.languageDutchLabel}
                </span>
              </span>
              <span className="text-xs text-gray-500">{languageCounts['nl'] ?? 0}</span>
            </label>
          ) : null}
          {(languageCounts['de'] ?? 0) > 0 || selectedLanguages.includes('de') ? (
            <label className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes('de')}
                  onChange={() => handleLanguageToggle('de')}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {labels.languageGermanLabel}
                </span>
              </span>
              <span className="text-xs text-gray-500">{languageCounts['de'] ?? 0}</span>
            </label>
          ) : null}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.materialTypesTitle}</h3>
        <div className="rounded-md border border-gray-200 shadow-sm">
          {visibleMaterialTypes.map((type) => (
            <label
              key={type.id}
              className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type.id)}
                  onChange={() => handleTypeToggle(type.id)}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {getTypeTitle(type)}
                </span>
              </span>
              <span className="text-xs text-gray-500">{typeCounts[type.id] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.schoolTypesTitle}</h3>
        <div className="rounded-md border border-gray-200 shadow-sm">
          {visibleSchoolTypes.map((item) => (
            <label
              key={item.id}
              className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSchoolTypes.includes(item.id)}
                  onChange={() => handleSchoolTypeToggle(item.id)}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {getTypeTitle(item)}
                </span>
              </span>
              <span className="text-xs text-gray-500">{schoolTypeCounts[item.id] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.competencesTitle}</h3>
        <div className="rounded-md border border-gray-200 shadow-sm">
          {visibleCompetences.map((item) => (
            <label
              key={item.id}
              className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCompetences.includes(item.id)}
                  onChange={() => handleCompetenceToggle(item.id)}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {getTypeTitle(item)}
                </span>
              </span>
              <span className="text-xs text-gray-500">{competenceCounts[item.id] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">{labels.topicsTitle}</h3>
        <div className="rounded-md border border-gray-200 shadow-sm">
          {visibleTopics.map((item) => (
            <label
              key={item.id}
              className="flex select-none items-center justify-between gap-3 bg-white group focus-visible:outline first:pt-3 last:pb-3 first:rounded-t-md last:rounded-b-md px-3 py-2"
            >
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(item.id)}
                  onChange={() => handleTopicToggle(item.id)}
                  className="size-4 rounded border-gray-300 text-black focus:ring-0"
                />
                <span className="text-sm text-gray-800 group-hover:underline">
                  {getTypeTitle(item)}
                </span>
              </span>
              <span className="text-xs text-gray-500">{topicCounts[item.id] ?? 0}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
