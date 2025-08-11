'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  const pathname = usePathname()
  const withoutLocale = pathname.replace(`/${locale}`, '')
  return (
    <aside className="bg-gray-50 p-4 px-6 md:p-6 lg:p-8 sidebar shrink-0 min-h-screen">
      <div className="ml-auto max-w-sm">
        <div className="flex items-end justify-between mb-4">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <img
              src="/assets/logo-edl.png"
              alt="Logo"
              width={128}
              className="w-16 md:w-32 aspect-[16/13]"
            />
            <span className="text-lg font-semibold sr-only">EDL Münster</span>
          </Link>
          <nav className="mt-3 flex items-center gap-2 text-sm">
            <Link
              href={locale === 'nl' ? '#' : `/nl${withoutLocale}`}
              className={`rounded font-medium px-2 py-1 ${locale === 'nl' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
            >
              NL
            </Link>
            <Link
              href={locale === 'de' ? '#' : `/de${withoutLocale}`}
              className={`rounded font-medium px-2 py-1 ${locale === 'de' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
            >
              DE
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </aside>
  )
}
