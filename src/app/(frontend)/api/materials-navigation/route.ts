import { SWR_CACHE } from '@/lib/apiCache'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'
export const revalidate = 1

/**
 * Lightweight API for MaterialNavigation.
 * Returns minimal fields needed for filtering and prev/next navigation.
 * Use this instead of passing all materials from the page to avoid ~500kb transfer.
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
    select: {
      id: true,
      slug: true,
      title_nl: true,
      title_de: true,
      description_nl: true,
      description_de: true,
      language: true,
      materialTypes: true,
      schoolTypes: true,
      competences: true,
      topics: true,
      cefr: true,
    },
  })

  return NextResponse.json(res.docs, {
    headers: { 'Cache-Control': SWR_CACHE },
  })
}
