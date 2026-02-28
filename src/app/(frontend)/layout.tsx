import React from 'react'
import { getLocaleFromHeaders } from '@/lib/domains'
import './styles.css'

export const metadata = {
  description: 'Lesmaterialen explorer',
  title: 'Lesmaterialen',
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLocaleFromHeaders()
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
