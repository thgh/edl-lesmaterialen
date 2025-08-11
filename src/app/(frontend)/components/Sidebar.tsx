import Link from 'next/link'
import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  return (
    <aside className="pb-6 bg-gray-50 px-4 py-4 sm:p-6 lg:p-8">
      <div className="flex items-end justify-between mb-4 md:mb-10">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <img src="/assets/logo-edl.png" alt="Logo" width={128} height={104} />
          <span className="text-lg font-semibold sr-only">EDL Münster</span>
        </Link>
        <nav className="mt-3 flex items-center gap-2 text-sm">
          <Link
            href="/nl"
            className={`rounded font-medium px-2 py-1 ${locale === 'nl' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
          >
            NL
          </Link>
          <Link
            href="/de"
            className={`rounded font-medium px-2 py-1 ${locale === 'de' ? 'bg-brand' : 'bg-white shadow hover:bg-gray-100'}`}
          >
            DE
          </Link>
        </nav>
      </div>
      {children}
    </aside>
  )
}
