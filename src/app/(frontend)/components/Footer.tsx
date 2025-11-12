'use client'

import { getDictionary } from '@/i18n/dictionaries'
import { usePathname } from 'next/navigation'
import { renderTextWithEmailLinks } from '../utils/text'

export function Footer() {
  const pathname = usePathname()
  const locale = (pathname?.split('/')[1] === 'de' ? 'de' : 'nl') as 'nl' | 'de'
  const dict = getDictionary(locale)

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="md:hidden mb-4">
        <img
          src="/assets/Euregionale Doorlopende Leerlijn.png"
          alt="Euregionale Doorlopende Leerlijn"
          className="h-12 mix-blend-multiply"
        />
      </div>
      <div className="text-sm text-gray-600 mb-4">{renderTextWithEmailLinks(dict.contactText)}</div>
      <div className="text-xs text-gray-500">{dict.disclaimerText}</div>
    </div>
  )
}
