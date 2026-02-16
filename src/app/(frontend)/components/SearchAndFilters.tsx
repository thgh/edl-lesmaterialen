/**
 * SearchAndFilters Component
 *
 * A comprehensive search and filtering interface for course materials that provides:
 *
 * 1. **Search Functionality**
 *    - Text input field for querying materials by keywords
 *    - Real-time search updates via onChange callback
 *
 * 2. **Multi-Category Filtering**
 *    - Material Types: Filter by different types of course materials
 *    - School Types: Filter by educational institution types
 *    - Competences: Filter by skill/competence areas
 *    - Topics: Filter by subject topics
 *    - Languages: Filter by Dutch (nl) or German (de) language
 *    - CEFR Levels: Filter by Common European Framework of Reference language levels
 *
 * 3. **Smart Filter Display Logic**
 *    - Options are sorted by result count (descending), then alphabetically by title
 *    - Options with zero results are hidden unless already selected (maintains user selections)
 *    - Each filter option displays its result count alongside the label
 *
 * 4. **Localization Support**
 *    - Supports Dutch (nl) and German (de) locales
 *    - Displays localized titles based on the current locale
 *    - Falls back to alternative language titles if primary is unavailable
 *
 * 5. **Performance Optimizations**
 *    - Uses useMemo to cache sorted and filtered lists, recalculating only when dependencies change
 *    - Uses useCallback for toggle handlers to prevent unnecessary re-renders
 *    - Memoized sorting logic combines count-based and alphabetical ordering
 *
 * 6. **State Management**
 *    - Controlled component: receives all state as props (searchQuery, selected filters)
 *    - Communicates all changes via single onChange callback with complete state object
 *    - Each filter toggle handler updates only its specific category while preserving others
 *
 * 7. **UI Components**
 *    - Reusable FilterSection component renders checkbox lists with counts
 *    - Consistent styling with Tailwind CSS classes
 *    - Accessible checkbox inputs with proper labels
 *
 * The component is designed to work with a parent component that manages the actual filtering
 * logic and material data, while this component handles the UI and user interactions.
 */

'use client'

import { CEFRLevels } from '@/collections/CEFRLevels'
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
  cefrTitle: string
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
  selectedCefrLevels: string[]
  onChange: (state: {
    query: string
    types: string[]
    schoolTypes: string[]
    competences: string[]
    topics: string[]
    languages: string[]
    cefrLevels: string[]
  }) => void
  labels: Labels
  typeCounts: Record<string, number>
  schoolTypeCounts: Record<string, number>
  competenceCounts: Record<string, number>
  topicCounts: Record<string, number>
  languageCounts: Record<string, number>
  cefrCounts: Record<string, number>
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
  selectedCefrLevels,
  onChange,
  labels,
  typeCounts,
  schoolTypeCounts,
  competenceCounts,
  topicCounts,
  languageCounts,
  cefrCounts,
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
        cefrLevels: selectedCefrLevels,
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
      selectedCefrLevels,
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
        cefrLevels: selectedCefrLevels,
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
      selectedCefrLevels,
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
        cefrLevels: selectedCefrLevels,
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
        cefrLevels: selectedCefrLevels,
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
      selectedCefrLevels,
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
  }, [materialTypes, typeCounts, locale, getLocalizedTitleForSort])

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
  }, [schoolTypes, schoolTypeCounts, locale, getLocalizedTitleForSort])

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
  }, [competences, competenceCounts, locale, getLocalizedTitleForSort])

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
  }, [topics, topicCounts, locale, getLocalizedTitleForSort])

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
        cefrLevels: selectedCefrLevels,
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
      selectedCefrLevels,
    ],
  )

  const handleCefrToggle = useCallback(
    (level: string) => {
      const next = selectedCefrLevels.includes(level)
        ? selectedCefrLevels.filter((x) => x !== level)
        : [...selectedCefrLevels, level]
      onChange({
        query: searchQuery,
        types: selectedTypes,
        schoolTypes: selectedSchoolTypes,
        competences: selectedCompetences,
        topics: selectedTopics,
        languages: selectedLanguages,
        cefrLevels: next,
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
      selectedCefrLevels,
    ],
  )

  const sortedCefrLevels = useMemo(() => {
    return [...CEFRLevels].sort((a, b) => {
      const countA = cefrCounts[a.value] ?? 0
      const countB = cefrCounts[b.value] ?? 0
      if (countB !== countA) return countB - countA
      return a.value.localeCompare(b.value)
    })
  }, [cefrCounts])

  const visibleCefrLevels = useMemo(() => {
    return sortedCefrLevels.filter(
      (level) => (cefrCounts[level.value] ?? 0) > 0 || selectedCefrLevels.includes(level.value),
    )
  }, [sortedCefrLevels, cefrCounts, selectedCefrLevels])

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
              cefrLevels: selectedCefrLevels,
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
        title={labels.topicsTitle}
        options={visibleTopics.map((item) => ({
          id: item.id,
          title: getLocalizedTitle(item),
          count: topicCounts[item.id] ?? 0,
        }))}
        selectedIds={selectedTopics}
        onToggle={handleTopicToggle}
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
        title={labels.cefrTitle}
        options={visibleCefrLevels.map((level) => ({
          id: level.value,
          title: level.label,
          count: cefrCounts[level.value] ?? 0,
        }))}
        selectedIds={selectedCefrLevels}
        onToggle={handleCefrToggle}
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
    </div>
  )
}
