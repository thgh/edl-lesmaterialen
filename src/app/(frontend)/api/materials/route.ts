import { getCachedMaterials } from '@/lib/cachedData'
import { NextResponse } from 'next/server'

/**
 * Returns all published materials with depth 0.
 * Taxonomies (materialTypes, schoolTypes, competences, topics) are IDs only -
 * resolve via /api/taxonomies. Use for lazy-loaded homepage grid.
 * Cached incrementally via Next.js 16 use cache; invalidated on material changes.
 */
export async function GET() {
  const docs = await getCachedMaterials()
  return NextResponse.json(docs)
}
