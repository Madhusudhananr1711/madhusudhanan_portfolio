import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { profile } from '../content/profile'
import type { Theme } from '../hooks/useTheme'

// Homepage sections with anchors
export const homeSections = [
  { id: 'top', hash: '#top', label: 'Home' },
  { id: 'work', hash: '#work', label: 'Work' },
  { id: 'github', hash: '#github', label: 'GitHub' },
  { id: 'experience', hash: '#experience', label: 'Experience' },
  { id: 'contact', hash: '#contact', label: 'Contact' },
]

// Dedicated pages with separate routes
export const dedicatedPages = [
  { path: '/architecture', label: 'Architecture' },
  { path: '/api-playground', label: 'API Playground' },
  { path: '/security', label: 'Security' },
  { path: '/docs', label: 'Docs' },
  { path: '/case-studies', label: 'Case Studies' },
]

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('top')
  const location = useLocation()
  const isHome = location.pathname === '/'

  // Track active section on the homepage via scroll position
  useEffect(() => {
    if (!isHome) return

    const handleScroll = () => {
      const scrollPos = window.scrollY + 200
      const sections = ['contact', 'experience', 'github', 'work', 'about', 'top']

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId)
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sectionId === 'about' ? 'top' : sectionId)
          return
        }
      }
      setActiveSection('top')
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHome])

  // Smooth scroll handler for homepage anchors
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    setOpen(false)
    if (isHome) {
      e.preventDefault()
      const targetId = hash.replace('#', '')
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' })
        window.history.pushState(null, '', hash)
        setActiveSection(targetId)
      }
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink/90 text-white backdrop-blur border-b border-white/10">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-3 sm:px-6 lg:px-8"
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={(e) => handleAnchorClick(e, '#top')}
          className="flex items-center gap-2 font-display text-base sm:text-lg font-bold tracking-tight transition-transform hover:opacity-90 shrink-0 mr-2"
          aria-label="Madhusudhanan R — Home"
        >
          <span className="grid h-8 w-8 place-items-center bg-amber text-sm font-bold text-ink rounded-sm">
            MR
          </span>
          <span className="hidden xl:inline">{profile.name}</span>
        </Link>

        {/* Desktop Hybrid Navigation Bar (All 10 Items) */}
        <ul className="hidden items-center gap-0.5 lg:flex font-medium text-xs xl:text-sm">
          {/* 1. Home */}
          <li>
            <Link
              to="/#top"
              onClick={(e) => handleAnchorClick(e, '#top')}
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                isHome && activeSection === 'top'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
          </li>

          {/* 2. Work */}
          <li>
            <Link
              to="/#work"
              onClick={(e) => handleAnchorClick(e, '#work')}
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                isHome && activeSection === 'work'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Work
            </Link>
          </li>

          {/* 3. GitHub */}
          <li>
            <Link
              to="/#github"
              onClick={(e) => handleAnchorClick(e, '#github')}
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                isHome && activeSection === 'github'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              GitHub
            </Link>
          </li>

          {/* 4. Experience */}
          <li>
            <Link
              to="/#experience"
              onClick={(e) => handleAnchorClick(e, '#experience')}
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                isHome && activeSection === 'experience'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Experience
            </Link>
          </li>

          {/* 5. Contact */}
          <li>
            <Link
              to="/#contact"
              onClick={(e) => handleAnchorClick(e, '#contact')}
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                isHome && activeSection === 'contact'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Contact
            </Link>
          </li>

          {/* Subtle Vertical Divider */}
          <li className="h-4 w-[1px] bg-white/20 mx-1" aria-hidden />

          {/* 6. Architecture */}
          <li>
            <Link
              to="/architecture"
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                location.pathname === '/architecture'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Architecture
            </Link>
          </li>

          {/* 7. API Playground */}
          <li>
            <Link
              to="/api-playground"
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                location.pathname === '/api-playground'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              API Playground
            </Link>
          </li>

          {/* 8. Security */}
          <li>
            <Link
              to="/security"
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                location.pathname === '/security'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Security
            </Link>
          </li>

          {/* 9. Docs */}
          <li>
            <Link
              to="/docs"
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                location.pathname === '/docs'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Docs
            </Link>
          </li>

          {/* 10. Case Studies */}
          <li>
            <Link
              to="/case-studies"
              className={`px-2.5 py-1.5 transition-colors rounded-sm ${
                location.pathname === '/case-studies'
                  ? 'text-amber bg-white/10 font-bold'
                  : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Case Studies
            </Link>
          </li>
        </ul>

        {/* Action Controls (Theme, Resume, Mobile Menu) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="grid h-9 w-9 place-items-center rounded-sm border border-white/20 transition-colors hover:border-amber hover:text-amber"
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          <a
            href={profile.resumeUrl}
            download
            className="hidden items-center gap-1.5 bg-amber px-3 py-2 text-xs font-bold text-ink transition-transform hover:-translate-y-0.5 sm:inline-flex rounded-sm"
          >
            <Download size={14} /> Resume
          </a>

          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-sm border border-white/20 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Responsive Mobile Drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="border-t border-white/10 bg-ink px-5 py-4 lg:hidden max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          {/* Section 1: Homepage Sections */}
          <p className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold mb-2">
            Homepage Sections
          </p>
          <ul className="grid grid-cols-2 gap-1 pb-4 border-b border-white/10">
            {homeSections.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/${s.hash}`}
                  onClick={(e) => handleAnchorClick(e, s.hash)}
                  className={`block px-3 py-2 text-sm rounded-sm ${
                    isHome && activeSection === s.id
                      ? 'bg-amber text-ink font-bold'
                      : 'text-white/80 hover:text-amber hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Section 2: Dedicated Pages */}
          <p className="font-mono text-[11px] uppercase tracking-wider text-amber font-semibold mt-4 mb-2">
            Dedicated Technical Pages
          </p>
          <ul className="grid gap-1 pb-4 border-b border-white/10">
            {dedicatedPages.map((p) => {
              const active = location.pathname === p.path
              return (
                <li key={p.path}>
                  <Link
                    to={p.path}
                    onClick={() => setOpen(false)}
                    className={`block px-3 py-2 text-sm rounded-sm ${
                      active
                        ? 'bg-amber text-ink font-bold'
                        : 'text-white/80 hover:text-amber hover:bg-white/5'
                    }`}
                  >
                    {p.label} <span className="font-mono text-xs opacity-60 ml-1">({p.path})</span>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Mobile Resume Button */}
          <div className="pt-4">
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex w-full items-center justify-center gap-2 bg-amber px-4 py-2.5 font-bold text-xs text-ink rounded-sm"
            >
              <Download size={14} /> Download Resume (PDF)
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
