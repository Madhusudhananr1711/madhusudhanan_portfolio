import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { projects } from '../content/projects'
import { profile } from '../content/profile'
import { Section, Tag } from './ui/Section'

export function Projects() {
  const [activeId, setActiveId] = useState(projects[0].id)
  const active = projects.find((p) => p.id === activeId) ?? projects[0]

  return (
    <Section
      id="work"
      eyebrow="Featured work"
      title="Projects"
      intro="Three projects across backend engineering, machine learning and analytics. Figures are the results reported in my resume."
    >
      <div role="tablist" aria-label="Featured projects" className="grid gap-3 md:grid-cols-3">
        {projects.map((p, i) => {
          const selected = p.id === active.id
          return (
            <button
              key={p.id}
              role="tab"
              id={`tab-${p.id}`}
              aria-selected={selected}
              aria-controls={`panel-${p.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveId(p.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  const next = (i + (e.key === 'ArrowRight' ? 1 : projects.length - 1)) % projects.length
                  setActiveId(projects[next].id)
                  document.getElementById(`tab-${projects[next].id}`)?.focus()
                }
              }}
              className={`border p-4 text-left transition-colors ${
                selected ? 'border-ink bg-ink text-white' : 'hairline hover:border-amber'
              }`}
            >
              <span className={`font-mono text-xs ${selected ? 'text-amber' : 'muted'}`}>0{i + 1}</span>
              <span className="mt-1 block font-display text-lg font-bold leading-snug">{p.title}</span>
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="card mt-4 grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.3fr_1fr]"
      >
        <div>
          <p className="font-mono text-xs uppercase tracking-widest muted">{active.kind}</p>
          <h3 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">{active.title}</h3>
          <p className="muted mt-4 text-lg leading-relaxed">{active.summary}</p>
          <ul className="mt-6 space-y-3">
            {active.bullets.map((b) => (
              <li key={b} className="flex gap-3 leading-relaxed">
                <span className="mt-2 h-2 w-2 shrink-0 bg-amber" aria-hidden />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {active.stack.map((s) => (
              <Tag key={s}>{s}</Tag>
            ))}
          </div>
          <a
            href={active.repoUrl ?? `${profile.github}?tab=repositories`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-8 inline-flex items-center gap-2 bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber hover:text-ink"
          >
            <ExternalLink size={15} />
            {active.repoUrl ? 'View repository' : 'Browse my GitHub repositories'}
          </a>
        </div>

        <dl className="grid content-start gap-3">
          {active.highlights.map((h) => (
            <div key={h.label} className="bg-amber p-5 text-ink">
              <dd className="font-display text-5xl font-bold leading-none tracking-tighter">{h.value}</dd>
              <dt className="mt-2 text-sm font-medium">{h.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  )
}
