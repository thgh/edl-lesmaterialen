'use client'

import { getDictionary } from '@/i18n/dictionaries'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

interface HeaderProps {
  locale: 'nl' | 'de'
}

export function Header({ locale }: HeaderProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const withoutLocale = pathname?.replace(`/${locale}`, '') ?? ''
  const dict = getDictionary(locale)

  return (
    <header className="w-full min-h-0 md:min-h-[150px] flex items-center border-b border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full mx-auto max-w-6xl">
        {/* Left: title, tagline under it, language switcher inline after title */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900">
              {dict.siteTitle}
            </h1>
            <nav className="flex items-center gap-2 text-sm">
              <a
                href={locale === 'nl' ? '#' : `/nl${withoutLocale}?${searchParams.toString()}`}
                className={`inline-flex items-center gap-1.5 rounded font-medium px-2 py-1 bg-gray-100 hover:bg-gray-200 ${locale === 'nl' ? 'border-2 border-gray-400' : 'border-2 border-transparent'}`}
              >
                <span>🇳🇱</span>
                NL
              </a>
              <a
                href={locale === 'de' ? '#' : `/de${withoutLocale}?${searchParams.toString()}`}
                className={`inline-flex items-center gap-1.5 rounded font-medium px-2 py-1 bg-gray-100 hover:bg-gray-200 ${locale === 'de' ? 'border-2 border-gray-400' : 'border-2 border-transparent'}`}
              >
                <span>🇩🇪</span>
                DE
              </a>
            </nav>
          </div>
          <p className="text-sm lg:text-base text-gray-600">{dict.siteTagline}</p>
        </div>
        {/* Right: logos (desktop only; on mobile they're in the footer) */}
        <div className="hidden md:flex shrink-0 items-center gap-6 md:gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false}>
            <img src="/assets/logo-edl.png" alt="EDL" className="h-10 md:h-12" />
            <span className="sr-only">EDL Münster</span>
          </Link>
          <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false}>
            <img src="/assets/logo-zns.svg" alt="ZNS" className="h-10 md:h-12" />
            <span className="sr-only">ZNS Zentrum für Niederländen-Studien</span>
          </Link>
          <img
            src="/assets/Euregionale Doorlopende Leerlijn.png"
            alt="Euregionale Doorlopende Leerlijn"
            className="h-10 w-auto object-contain mix-blend-multiply md:h-[150px]"
          />
        </div>
      </div>
    </header>
  )
}
