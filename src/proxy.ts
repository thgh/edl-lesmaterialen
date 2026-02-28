import { NextRequest } from 'next/server'

/**
 * Proxy/middleware hook. With domain-based routing (no /nl or /de in paths),
 * locale is determined by host. No redirect needed - pass through.
 */
export function proxy(_request: NextRequest) {
  return
}

export const config = {
  matcher: [
    '/((?!_next|assets|admin|api|import).*)',
  ],
}
