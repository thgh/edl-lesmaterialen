'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const withoutLocale = pathname.replace(`/${locale}`, '')

  return (
    <aside className="bg-gray-50 p-4 px-6 md:p-6 lg:p-8 sidebar shrink-0 md:min-h-screen">
      <div className="ml-auto md:max-w-sm">
        <div className="flex items-end justify-between mb-4">
          <Link href={`/${locale}`} className="flex items-center gap-3" prefetch={false}>
            <img
              src="/assets/logo-edl.png"
              alt="Logo"
              width={128}
              className="w-16 md:w-32 aspect-[16/13]"
            />
            <span className="text-lg font-semibold sr-only">EDL Münster</span>
          </Link>
          <nav className="mt-3 flex items-center gap-2 text-sm">
            <a
              href={locale === 'nl' ? '#' : `/nl${withoutLocale}`}
              className={`rounded font-medium px-2 py-1 ${locale === 'nl' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
              onClick={(evt) => {
                if (locale === 'nl') return
                console.log('nl', evt)
                evt.preventDefault()
                router.push(`/nl${withoutLocale}${window.location.search}`)
              }}
            >
              NL
            </a>
            <a
              href={locale === 'de' ? '#' : `/de${withoutLocale}`}
              className={`rounded font-medium px-2 py-1 ${locale === 'de' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
              onClick={(evt) => {
                if (locale === 'de') return
                console.log('de', evt)
                evt.preventDefault()
                router.push(`/de${withoutLocale}${window.location.search}`)
              }}
            >
              DE
            </a>
          </nav>
        </div>
        {children}
      </div>
    </aside>
  )
}
