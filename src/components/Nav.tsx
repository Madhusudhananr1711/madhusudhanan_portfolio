import { useState } from 'react'
import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { profile } from '../content/profile'
import type { Theme } from '../hooks/useTheme'

const links = [
  { href: '#work', label: 'Work' },
  { href: '#architecture', label: 'Architecture' },
  { href: '#playground', label: 'API Playground' },
  { href: '#security', label: 'Security' },
  { href: '#docs', label: 'Docs' },
  { href: '#case-studies', label: 'Case Studies' },
  { href: '#github', label: 'GitHub' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

export function Nav({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-ink/85 text-white backdrop-blur">
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight" aria-label="Madhusudhanan R — home">
          <span className="grid h-8 w-8 place-items-center bg-amber text-sm text-ink">MR</span>
          <span className="hidden sm:inline">{profile.name}</span>
        </a>

        <ul className="hidden items-center gap-5 xl:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="text-sm text-white/75 transition-colors hover:text-amber">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="grid h-9 w-9 place-items-center rounded-sm border border-white/25 transition-colors hover:border-amber hover:text-amber"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <a
            href={profile.resumeUrl}
            download
            className="hidden items-center gap-2 bg-amber px-3.5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <Download size={15} /> Resume
          </a>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-sm border border-white/25 xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 bg-ink px-5 pb-5 xl:hidden">
          <ul className="grid gap-1 pt-3">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-base text-white/85 hover:text-amber">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={profile.resumeUrl} download className="mt-2 inline-flex items-center gap-2 bg-amber px-4 py-2 font-semibold text-ink">
                <Download size={16} /> Download resume
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
