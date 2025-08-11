import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 3600 // 1 hour

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Validate that the URL is a PDF
    if (!url.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF URLs are allowed' }, { status: 400 })
    }

    // Fetch the PDF content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EDL/1.0',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the PDF content
    const pdfBuffer = await response.arrayBuffer()

    // Return the PDF with appropriate headers
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=2592000', // Cache for 1 month with stale-while-revalidate
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('PDF proxy error:', error)
    return NextResponse.json({ error: 'Failed to proxy PDF' }, { status: 500 })
  }
}
