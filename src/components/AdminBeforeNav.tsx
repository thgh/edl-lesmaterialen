import Link from 'next/link'

export default function AdminBeforeNav() {
  return (
    <Link className="nav__link" style={{ margin: '1rem 0 2rem' }} href="/nl">
      <span className="nav__link-label">Terug naar website</span>
    </Link>
  )
}
