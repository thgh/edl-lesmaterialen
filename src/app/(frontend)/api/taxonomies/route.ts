import { getCachedTaxonomies } from '@/lib/cachedData'
import { NextResponse } from 'next/server'

/**
 * Lightweight API for sidebar taxonomies.
 * Returns minimal fields (id, title_nl, title_de) for material-types, school-types,
 * competences, and topics. Use for lazy-loaded filter sidebar.
 * Cached incrementally via Next.js 16 use cache; invalidated on taxonomy changes.
 */
export async function GET() {
  const taxonomies = await getCachedTaxonomies()
  return NextResponse.json(taxonomies)
}
