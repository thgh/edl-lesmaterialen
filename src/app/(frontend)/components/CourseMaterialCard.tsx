import { CourseMaterial, CourseMaterialAttachment } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'

interface CourseMaterialCardProps {
  material: CourseMaterial
  locale: 'nl' | 'de'
  cefrLabel: string
  filters?: {
    searchQuery: string
    selectedTypes: string[]
    selectedSchoolTypes: string[]
    selectedCompetences: string[]
    selectedTopics: string[]
    selectedLanguages: string[]
    selectedCefrLevels: string[]
  }
}

export function CourseMaterialCard({
  material,
  locale,
  cefrLabel,
  filters,
}: CourseMaterialCardProps) {
  const getTitle = () => {
    return (
      (locale === 'de' ? material.title_de : material.title_nl) ||
      material.title_de ||
      material.title_nl ||
      'Untitled'
    )
  }

  const getMaterialTypes = (): {
    displayed: string[]
    remaining: string[]
  } => {
    if (!material.materialTypes || material.materialTypes.length === 0) {
      return { displayed: [], remaining: [] }
    }

    // Helper to get ID from a material type (can be string or object)
    const getTypeId = (type: any): string | null => {
      if (typeof type === 'string') return type
      if (typeof type === 'object' && type && 'id' in type) return String(type.id)
      return null
    }

    // Helper to get localized title from a material type
    const getTypeTitle = (type: any): string | null => {
      if (typeof type === 'object' && type) {
        return (
          (locale === 'de' ? type.title_de : type.title_nl) ||
          type.title_nl ||
          type.title_de ||
          null
        )
      }
      return null
    }

    // Separate filtered and non-filtered types
    const filteredTypes: any[] = []
    const otherTypes: any[] = []

    // Check if we have active type filters
    const hasTypeFilter = filters?.selectedTypes && filters.selectedTypes.length > 0

    for (const type of material.materialTypes) {
      const typeId = getTypeId(type)
      if (!typeId) continue

      if (hasTypeFilter && filters!.selectedTypes.includes(typeId)) {
        filteredTypes.push(type)
      } else {
        otherTypes.push(type)
      }
    }

    // Prioritize filtered types, then add others up to 2 total
    const selectedTypes: any[] = []
    const remainingTypes: any[] = []

    // Add filtered types first (up to 2)
    for (let i = 0; i < Math.min(filteredTypes.length, 2); i++) {
      selectedTypes.push(filteredTypes[i])
    }
    // Add remaining filtered types
    for (let i = 2; i < filteredTypes.length; i++) {
      remainingTypes.push(filteredTypes[i])
    }

    // Add other types if we haven't reached 2 yet
    if (selectedTypes.length < 2) {
      const needed = 2 - selectedTypes.length
      for (let i = 0; i < Math.min(otherTypes.length, needed); i++) {
        selectedTypes.push(otherTypes[i])
      }
      // Add remaining other types
      for (let i = needed; i < otherTypes.length; i++) {
        remainingTypes.push(otherTypes[i])
      }
    } else {
      // If we already have 2 selected, add all other types to remaining
      remainingTypes.push(...otherTypes)
    }

    // Convert to localized titles
    const displayed = selectedTypes
      .map(getTypeTitle)
      .filter((title): title is string => title !== null)
    const remaining = remainingTypes
      .map(getTypeTitle)
      .filter((title): title is string => title !== null)

    return { displayed, remaining }
  }

  const getCefrLevels = () => {
    if (material.cefr && material.cefr.length > 0) {
      return material.cefr.join(', ')
    }
    return ''
  }

  const getSchoolType = () => {
    if (
      material.schoolTypes &&
      Array.isArray(material.schoolTypes) &&
      material.schoolTypes.length > 0
    ) {
      return material.schoolTypes
        .map((st) =>
          typeof st === 'object'
            ? locale === 'de'
              ? (st as any).title_de
              : (st as any).title_nl
            : '',
        )
        .filter(Boolean)
        .join(', ')
    }
    return ''
  }

  const getTopics = () => {
    if (material.topics && material.topics.length > 0) {
      return material.topics
        .map((topic) =>
          typeof topic === 'object'
            ? locale === 'de'
              ? (topic as any).title_de
              : (topic as any).title_nl
            : '',
        )
        .filter(Boolean)
        .join(', ')
    }
    return ''
  }

  const getCompetences = () => {
    if (material.competences && material.competences.length > 0) {
      return material.competences
        .map((comp) =>
          typeof comp === 'object'
            ? locale === 'de'
              ? (comp as any).title_de
              : (comp as any).title_nl
            : '',
        )
        .filter(Boolean)
        .join(', ')
    }
    return ''
  }

  const thumbnail = ((material.attachments as CourseMaterialAttachment[]) || []).find(
    (a) => a && typeof a === 'object' && a.mimeType?.startsWith('image/'),
  )
  const slug = material.slug || `id:${material.id}`
  const { displayed: displayedTypes, remaining: remainingTypes } = getMaterialTypes()

  // Build URL with filters
  const buildDetailUrl = () => {
    const baseUrl = `/${locale}/lesmateriaal/${slug}`
    if (!filters) return baseUrl

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
    if (filters.selectedCefrLevels.length > 0)
      params.set('cefr', filters.selectedCefrLevels.join(','))

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  return (
    <Link href={buildDetailUrl()} className="block">
      <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md overflow-visible">
        {thumbnail && (
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-gray-50">
            <Image
              src={thumbnail.url!}
              alt={getTitle()}
              fill
              sizes="(min-width: 768px) 33vw, 100vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex flex-wrap items-center gap-1.5">
              {displayedTypes.map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 h-5"
                >
                  {type}
                </span>
              ))}
              {remainingTypes.length > 0 && (
                <span className="group relative inline-flex items-center rounded bg-gray-100 px-2 py-0.5 h-5 cursor-help">
                  +{remainingTypes.length}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 z-50 pointer-events-none">
                    <div className="bg-gray-900 text-white text-xs rounded py-1.5 px-2 shadow-lg min-w-max">
                      <div className="flex flex-col gap-1">
                        {remainingTypes.map((type, index) => (
                          <span key={index}>{type}</span>
                        ))}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </span>
              )}
              {displayedTypes.length === 0 && remainingTypes.length === 0 && (
                <span className="inline-flex items-center rounded px-2 py-0.5 h-5">&nbsp;</span>
              )}
            </div>
          </div>

          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{getTitle()}</h3>

          <div className="space-y-1 text-sm text-gray-700">
            {getCefrLevels() && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{cefrLabel}</span>
                <span>{getCefrLevels()}</span>
              </div>
            )}

            {getSchoolType() && <div>{getSchoolType()}</div>}
            {getTopics() && <div>{getTopics()}</div>}
            {getCompetences() && <div>{getCompetences()}</div>}
          </div>
        </div>
      </article>
    </Link>
  )
}
