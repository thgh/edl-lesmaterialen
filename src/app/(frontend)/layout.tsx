import { getLocaleFromHeaders } from '@/lib/domains'
import React, { Suspense } from 'react'
import './styles.css'

export const dynamic = 'force-dynamic'

export const metadata = {
  description: 'Lesmaterialen explorer',
  title: 'Lesmaterialen',
}

async function LocaleLayoutInner({ children }: { children: React.ReactNode }) {
  const lang = await getLocaleFromHeaders()
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}

function LayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  )
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LayoutFallback>{children}</LayoutFallback>}>
      <LocaleLayoutInner>{children}</LocaleLayoutInner>
    </Suspense>
  )
}
