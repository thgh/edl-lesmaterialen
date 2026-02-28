import config from '@/payload.config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

/**
 * Returns all published materials with depth 0.
 * Taxonomies (materialTypes, schoolTypes, competences, topics) are IDs only -
 * resolve via /api/taxonomies. Use for lazy-loaded homepage grid.
 */
export async function GET() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const res = await payload.find({
    collection: 'course-materials',
    where: { status: { not_equals: 'draft' } },
    limit: 9999,
    sort: '-createdAt',
    depth: 0,
  })

  return NextResponse.json(res.docs)
}
