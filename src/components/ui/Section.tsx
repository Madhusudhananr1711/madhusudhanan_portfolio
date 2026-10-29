import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface Props {
  id: string
  eyebrow: string
  title: string
  intro?: ReactNode
  children: ReactNode
}

/** Standard content section on the page surface (white in light theme, near-black in dark). */
export function Section({ id, eyebrow, title, intro, children }: Props) {
  return (
    <section id={id} className="surface border-t hairline">
      <div className="mx-auto max-w-[1200px] px-5 py-20 sm:px-8 lg:py-28">
        <Reveal>
          <p className="mb-3 inline-block bg-amber px-2 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-ink">
            {eyebrow}
          </p>
          <h2 className="max-w-3xl font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h2>
          {intro && <p className="muted mt-5 max-w-2xl text-base leading-relaxed sm:text-lg">{intro}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'amber' | 'ink' }) {
  const tones = {
    default: 'border hairline',
    amber: 'bg-amber text-ink border border-amber',
    ink: 'bg-ink text-white border border-ink',
  }
  return (
    <span className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Badge({ kind }: { kind: 'simulated' | 'live' | 'example' }) {
  const map = {
    simulated: 'bg-amber text-ink',
    live: 'bg-emerald-500 text-ink',
    example: 'bg-ash text-ink',
  } as const
  const label = { simulated: 'Simulated', live: 'Live', example: 'Example' }[kind]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider ${map[kind]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-ink" aria-hidden />
      {label}
    </span>
  )
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <pre
      className="overflow-x-auto rounded-sm p-4 font-mono text-[12.5px] leading-relaxed"
      style={{ background: 'var(--code-bg)', color: 'var(--code-fg)' }}
      aria-label={lang ? `${lang} code example` : 'code example'}
      tabIndex={0}
    >
      <code>{code}</code>
    </pre>
  )
}
