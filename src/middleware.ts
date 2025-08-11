import { NextRequest, NextResponse } from 'next/server'

let locales = ['nl', 'de']

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
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
    '/((?!_next|assets|admin|api).*)',
    // Optional: only run on root (/) URL
    // '/'
  ],
}
