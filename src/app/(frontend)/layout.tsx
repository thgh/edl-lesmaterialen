import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Lesmaterialen explorer',
  title: 'Lesmaterialen',
}

export function generateStaticParams() {
  return [{ lang: 'nl' }, { lang: 'de' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang?: 'nl' | 'de' }>
}) {
  const p = await params
  const lang = p.lang === 'de' ? 'de' : 'nl'
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  )
}
