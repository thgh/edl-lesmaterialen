'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const withoutLocale = pathname.replace(`/${locale}`, '')

  return (
    <aside className="bg-gray-50 p-4 px-6 md:p-6 lg:p-8 sidebar shrink-0 md:min-h-screen">
      <div className="ml-auto md:max-w-sm">
        <div className="flex items-center justify-between md:flex-col md:items-start gap-4 mb-4">
          <div className="flex items-center gap-8">
            <Link
              href={`/${locale}`}
              className="md:flex-1 flex items-center gap-3"
              prefetch={false}
            >
              <img src="/assets/logo-edl.png" alt="Logo" className="h-12 md:h-auto" />
              <span className="text-lg font-semibold sr-only">EDL Münster</span>
            </Link>
            <Link
              href={`/${locale}`}
              className="md:flex-1 flex items-center gap-3"
              prefetch={false}
            >
              <img src="/assets/logo-zns.svg" alt="Logo" className="h-12 md:h-auto" />
              <span className="text-lg font-semibold sr-only">
                ZNS Zentrum für Niederländen-Studien
              </span>
            </Link>
            <img
              src="/assets/Euregionale Doorlopende Leerlijn.png"
              alt="Euregionale Doorlopende Leerlijn"
              className="h-12 md:hidden mix-blend-multiply"
            />
          </div>
        </div>
        {children}
        <div className="hidden md:block sticky bottom-0 bg-gray-50 -mx-4 md:-mx-6 lg:-mx-8">
          <img
            src="/assets/Euregionale Doorlopende Leerlijn.png"
            alt="Euregionale Doorlopende Leerlijn"
            className="w-full h-auto max-w-full mix-blend-multiply"
          />
        </div>
      </div>
    </aside>
  )
}
