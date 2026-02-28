import config from '@/payload.config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

type TaxonomyItem = { id: string; title_nl?: string | null; title_de?: string | null }

/**
 * Lightweight API for sidebar taxonomies.
 * Returns minimal fields (id, title_nl, title_de) for material-types, school-types,
 * competences, and topics. Use for lazy-loaded filter sidebar.
 */
export async function GET() {
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

  return NextResponse.json({
    materialTypes: materialTypes.docs as TaxonomyItem[],
    schoolTypes: schoolTypes.docs as TaxonomyItem[],
    competences: competences.docs as TaxonomyItem[],
    topics: topics.docs as TaxonomyItem[],
  })
}
