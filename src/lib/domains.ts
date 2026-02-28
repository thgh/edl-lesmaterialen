export type Locale = 'nl' | 'de'

/** Domain for the Dutch site */
export const SITE_DOMAIN_NL = 'https://onderwijsmateriaal-buurtaal.nl'

/** Domain for the German site */
export const SITE_DOMAIN_DE = 'https://unterrichtsmaterial-nachbarsprache.de'

/** Map locale to its domain */
export const LOCALE_DOMAINS: Record<Locale, string> = {
  nl: SITE_DOMAIN_NL,
  de: SITE_DOMAIN_DE,
}

/** Known German domain hostname (without port) */
const GERMAN_DOMAIN_HOST = new URL(SITE_DOMAIN_DE).hostname

/**
 * Resolve locale from request host. Uses NL unless the domain matches the known
 * German domain or ends with .de.
 */
export function getLocaleFromHost(host: string): Locale {
  const hostname = host.split(':')[0]
  if (hostname === GERMAN_DOMAIN_HOST || hostname.endsWith('.de')) return 'de'
  return 'nl'
}

/** Get locale from request headers (for server components). Uses NL unless host matches German domain or ends with .de. */
export async function getLocaleFromHeaders(): Promise<Locale> {
  const { headers } = await import('next/headers')
  const headersList = await headers()
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || ''
  return getLocaleFromHost(host)
}

/**
 * Returns the full URL for a locale (used for cross-domain language switching).
 * @param locale - Target locale
 * @param path - Path including leading slash (e.g. "/lesmateriaal/foo" or "/")
 */
export function getLocaleUrl(locale: Locale, path: string): string {
  const base = LOCALE_DOMAINS[locale]
  const pathWithLeadingSlash = path.startsWith('/') ? path : `/${path}`
  return `${base}${pathWithLeadingSlash}`
}
