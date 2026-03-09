import config from '@/payload.config'
import { getPayload } from 'payload'

export const CACHE_TAG_MATERIALS = 'materials'
export const CACHE_TAG_TAXONOMIES = 'taxonomies'

type TaxonomyItem = { id: string; title_nl?: string | null; title_de?: string | null }

/**
 * Cached materials fetch. Returns all published course-materials with depth 0.
 * Invalidated when materials change via revalidateTag(CACHE_TAG_MATERIALS).
 */
export async function getCachedMaterials() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'course-materials',
    where: { status: { not_equals: 'draft' } },
    limit: 9999,
    sort: '-createdAt',
    depth: 0,
  })

  return res.docs
}

/**
 * Cached taxonomies fetch. Returns minimal fields for filter sidebar.
 * Invalidated when any taxonomy changes via revalidateTag(CACHE_TAG_TAXONOMIES).
 */
export async function getCachedTaxonomies() {

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const [materialTypes, schoolTypes, competences, topics] = await Promise.all([
    payload.find({
      collection: 'material-types',
      limit: 999,
      depth: 0,
      select: { id: true, title_nl: true, title_de: true },
    }),
    payload.find({
      collection: 'school-types',
      limit: 999,
      depth: 0,
      select: { id: true, title_nl: true, title_de: true },
    }),
    payload.find({
      collection: 'competences',
      limit: 999,
      depth: 0,
      select: { id: true, title_nl: true, title_de: true },
    }),
    payload.find({
      collection: 'topics',
      limit: 999,
      depth: 0,
      select: { id: true, title_nl: true, title_de: true },
    }),
  ])

  return {
    materialTypes: materialTypes.docs as TaxonomyItem[],
    schoolTypes: schoolTypes.docs as TaxonomyItem[],
    competences: competences.docs as TaxonomyItem[],
    topics: topics.docs as TaxonomyItem[],
  }
}
