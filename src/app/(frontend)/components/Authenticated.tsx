'use client'

import useSWR from 'swr'
import { fetcher } from './fetcher'

export function Authenticated({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSWR('/api/users/me', fetcher).data?.user
  if (!isAuthenticated) return null
  return <>{children}</>
}
