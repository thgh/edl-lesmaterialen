'use client'

import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  return (
    <aside className="p-4 px-6 md:p-6 lg:p-8 sidebar shrink-0 md:min-h-screen md:w-80 md:min-w-80">
      <div className="ml-auto md:max-w-sm w-full">{children}</div>
    </aside>
  )
}
