import { SITE_DOMAIN_NL } from '@/lib/domains'
import Link from 'next/link'

export default function AdminBeforeNav() {
  return (
    <Link className="nav__link" style={{ margin: '1rem 0 2rem' }} href={SITE_DOMAIN_NL}>
      <span className="nav__link-label">Terug naar website</span>
    </Link>
  )
}
