import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Nav, dedicatedPages, homeSections } from './Nav'
import { useTheme } from '../hooks/useTheme'
import { useScrollToTop } from '../hooks/useScrollToTop'
import { usePageTitle } from '../hooks/usePageTitle'
import { profile } from '../content/profile'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { theme, toggle } = useTheme()
  useScrollToTop()
  usePageTitle()

  return (
    <div className="min-h-screen flex flex-col surface">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-amber focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to main content
      </a>

      <Nav theme={theme} onToggleTheme={toggle} />

      <main id="main" className="flex-1">
        {children}
      </main>

      <footer className="bg-ink px-5 py-12 text-center text-sm text-white/70 border-t border-white/10">
        <div className="mx-auto max-w-[1200px] flex flex-col items-center gap-6">
          {/* Hybrid Navigation in Footer */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-mono">
            <div className="flex flex-wrap justify-center gap-4 text-white/80">
              {homeSections.map((s) => (
                <Link key={s.id} to={`/${s.hash}`} className="hover:text-amber transition-colors">
                  {s.label}
                </Link>
              ))}
            </div>

            <span className="hidden sm:inline text-white/20">|</span>

            <div className="flex flex-wrap justify-center gap-4 text-amber">
              {dedicatedPages.map((p) => (
                <Link key={p.path} to={p.path} className="hover:underline transition-colors font-semibold">
                  {p.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="h-[1px] w-24 bg-white/20" />

          <p className="max-w-xl text-xs text-white/50 leading-relaxed">
            © {new Date().getFullYear()} {profile.name} · Full Stack & Backend Developer. Built with React 19, TypeScript, Vite, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  )
}
