'use client'

import { getDictionary } from '@/i18n/dictionaries'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { renderTextWithEmailLinks } from '../utils/text'

export function Footer() {
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] === 'de' ? 'de' : 'nl') as 'nl' | 'de'
  const dict = getDictionary(locale)

  return (
    <div className="mt-8 pt-6 border-t border-gray-200 text-gray-700">
      <div className="mx-auto max-w-6xl">
        {/* Logos: mobile only (on desktop they're in the header) */}
        <div className="mb-4 flex items-center gap-6 my-8">
          <img
            src="/assets/Euregionale Doorlopende Leerlijn.png"
            alt="Euregionale Doorlopende Leerlijn"
            className="h-[150px] w-auto object-contain mix-blend-multiply"
          />
          <div className="text-sm basis-0 grow">{dict.fundingText}</div>
        </div>
        <div className="flex items-center justify-center gap-6 my-8 md:gap-12">
          <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false}>
            <img src="/assets/logo-edl.png" alt="EDL" className="h-12 md:h-20" />
            <span className="sr-only">EDL Münster</span>
          </Link>
          <Link href={`/${locale}`} className="flex items-center gap-2" prefetch={false}>
            <img src="/assets/logo-zns.svg" alt="ZNS" className="h-12 md:h-20" />
            <span className="sr-only">ZNS Zentrum für Niederländen-Studien</span>
          </Link>
        </div>
        <div className="text-sm mb-4">{renderTextWithEmailLinks(dict.contactText)}</div>
        <div className="text-xs mb-4">{dict.disclaimerText}</div>
      </div>
    </div>
  )
}
