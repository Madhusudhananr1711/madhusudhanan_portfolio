import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Crumb {
  label: string
  href?: string
}

interface Props {
  items: Crumb[]
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 font-mono text-xs text-white/70">
        <li>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-amber"
            aria-label="Home"
          >
            <Home size={13} aria-hidden />
            <span>Home</span>
          </Link>
        </li>
        {items.map((crumb, idx) => {
          const isLast = idx === items.length - 1
          return (
            <li key={crumb.label} className="flex items-center gap-2">
              <ChevronRight size={12} className="opacity-40" aria-hidden />
              {isLast || !crumb.href ? (
                <span className="font-semibold text-amber" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.href} className="transition-colors hover:text-amber">
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
