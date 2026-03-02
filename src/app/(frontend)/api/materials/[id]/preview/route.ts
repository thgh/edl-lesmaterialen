import config from '@/payload.config'
import { readFile } from 'fs/promises'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { getPayload } from 'payload'

/**
 * Serves the preview image for a course material by material ID.
 * Use when material.preview is only populated as an ID (depth 0).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: materialId } = await params
  if (!materialId) {
    return NextResponse.json({ error: 'Material ID is required' }, { status: 400 })
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const material = await payload.findByID({
    collection: 'course-materials',
    id: materialId,
    depth: 0,
  })

  const previewId =
    typeof material.preview === 'string'
      ? material.preview
      : material.preview && typeof material.preview === 'object' && 'id' in material.preview
        ? (material.preview as { id: string }).id
        : null

  if (!previewId) {
    return NextResponse.json({ error: 'No preview for this material' }, { status: 404 })
  }

  const attachment = await payload.findByID({
    collection: 'course-material-attachments',
    id: previewId,
  })

  if (!attachment.filename) {
    return NextResponse.json({ error: 'Preview file not found' }, { status: 404 })
  }

  const mimeType = attachment.mimeType || 'image/jpeg'
  if (!mimeType.startsWith('image/')) {
    return NextResponse.json({ error: 'Preview is not an image' }, { status: 400 })
  }

  // If Payload provides a URL (e.g. from storage adapter), redirect to it
  if (attachment.url && attachment.url.startsWith('http')) {
    return NextResponse.redirect(attachment.url)
  }

  // Serve from local static dir
  const staticDir = path.join(process.cwd(), 'uploads', 'course-material-attachments')
  const filePath = path.join(staticDir, attachment.filename)

  try {
    const buffer = await readFile(filePath)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=2592000',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Preview file not found' }, { status: 404 })
  }
}
