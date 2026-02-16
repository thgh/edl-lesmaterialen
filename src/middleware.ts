import { NextRequest, NextResponse } from 'next/server'

const locales = ['nl', 'de']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip redirect for special paths like .well-known, favicon, robots.txt, etc.
  if (
    pathname.startsWith('/.well-known/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.json'
  ) {
    return
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = request.nextUrl.locale || 'nl'
  request.nextUrl.pathname = `/${locale}${pathname}`
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  console.log('redirecting to', request.nextUrl.pathname)
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|assets|admin|api|import).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}
