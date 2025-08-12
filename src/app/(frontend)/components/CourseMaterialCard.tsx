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

  const getMaterialType = () => {
    if (material.materialTypes && material.materialTypes.length > 0) {
      const materialType = material.materialTypes[0]
      if (typeof materialType === 'object') {
        return (
          (locale === 'de' ? (materialType as any).title_de : (materialType as any).title_nl) ||
          (materialType as any).title_nl ||
          (materialType as any).title_de ||
          '—'
        )
      }
    }
    return '—'
  }

  const getCefrLevels = () => {
    if (material.cefr && material.cefr.length > 0) {
      return material.cefr.join(', ')
    }
    return ''
  }

  const getSchoolType = () => {
    if (material.schoolType && typeof material.schoolType === 'object') {
      return (
        (locale === 'de'
          ? (material.schoolType as any).title_de
          : (material.schoolType as any).title_nl) || ''
      )
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

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }

  return (
    <Link href={buildDetailUrl()} className="block">
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
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
            <span className="rounded bg-gray-100 px-2 py-0.5">{getMaterialType()}</span>
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
