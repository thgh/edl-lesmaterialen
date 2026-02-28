'use client'

import { ReactNode } from 'react'

interface SidebarProps {
  locale: 'nl' | 'de'
  children?: ReactNode
}

export function Sidebar({ locale, children }: SidebarProps) {
  return (
    <aside className="p-4 px-6 md:p-6 lg:p-8 sidebar shrink-0 md:min-h-screen">
      <div className="ml-auto md:max-w-sm">{children}</div>
    </aside>
  )
}
