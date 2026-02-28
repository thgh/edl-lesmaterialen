import { getDictionary } from '@/i18n/dictionaries'
import { getLocaleFromHeaders } from '@/lib/domains'
import {
  filterAndSortMaterials,
  parseFiltersFromSearchParams,
} from '@/lib/filterMaterials'
import config from '@/payload.config'
import { getPayload } from 'payload'
import { MaterialsExplorer } from './components/MaterialsExplorer'
import './styles.css'

export const revalidate = 1
export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const lang = await getLocaleFromHeaders()
  const dict = getDictionary(lang)
  const sp = await searchParams

  const filters = parseFiltersFromSearchParams(sp ?? {})

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const materialsResponse = await payload.find({
    collection: 'course-materials',
    where: { status: { not_equals: 'draft' } },
    depth: 1,
    limit: 300,
    sort: '-createdAt',
  })

  const allFetched = materialsResponse.docs as any[]
  const filteredAndSorted = filterAndSortMaterials(allFetched, filters, lang)
  const initialMaterials = filteredAndSorted.slice(0, 12)

  return (
    <MaterialsExplorer
      initialMaterials={initialMaterials as any}
      lang={lang}
      labels={{
        searchTitle: dict.searchTitle,
        searchPlaceholder: dict.searchPlaceholder,
        materialTypesTitle: dict.materialTypesTitle,
        schoolTypesTitle: dict.schoolTypesTitle,
        competencesTitle: dict.competencesTitle,
        topicsTitle: dict.topicsTitle,
        cefrTitle: dict.cefrTitle,
        cefrLabel: dict.cefrLabel,
        languagesTitle: dict.languagesTitle,
        languageDutchLabel: dict.languageDutch,
        languageGermanLabel: dict.languageGerman,
        showFilters: dict.showFilters,
        hideFilters: dict.hideFilters,
      }}
    />
  )
}
