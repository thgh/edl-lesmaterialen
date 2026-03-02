import { getLocaleFromHeaders } from '@/lib/domains'
import {
  buildWhereFromFilters,
  filterAndSortMaterials,
  parseFiltersFromSearchParams,
} from '@/lib/filterMaterials'
import config from '@/payload.config'
import type { Where } from 'payload'
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
  const start = performance.now()
  const lang = await getLocaleFromHeaders()
  const sp = await searchParams

  const filters = parseFiltersFromSearchParams(sp ?? {})
  console.log(`filters: ${performance.now() - start}ms`)

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const whereConditions: Where[] = [
    { status: { not_equals: 'draft' } },
    ...(buildWhereFromFilters(filters) as Where[]),
  ]
  const where: Where = whereConditions.length === 1 ? whereConditions[0] : { and: whereConditions }

  console.log(`payload: ${performance.now() - start}ms`)
  const materialsResponse = await payload.find({
    collection: 'course-materials',
    where,
    depth: 1,
    limit: 24,
    sort: '-createdAt',
  })
  console.log(`find: ${performance.now() - start}ms`)

  const allFetched = materialsResponse.docs as any[]
  const filteredAndSorted = filterAndSortMaterials(allFetched, filters, lang)
  const initialMaterials = filteredAndSorted.slice(0, 12)

  console.log(`initialMaterials: ${performance.now() - start}ms`)
  return (
    <MaterialsExplorer
      initialMaterials={initialMaterials as any}
      initialFilters={filters}
      lang={lang}
    />
  )
}
