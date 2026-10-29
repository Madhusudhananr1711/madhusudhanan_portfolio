import { useState } from 'react'
import { caseStudies } from '../content/caseStudies'
import { Section } from './ui/Section'

export function CaseStudies() {
  const [openId, setOpenId] = useState<string | null>(caseStudies[0].id)
  return (
    <Section
      id="case-studies"
      eyebrow="Engineering notes"
      title="Case studies"
      intro="How I approach the technical problems behind each project: the challenge, the approach, the trade-offs, and the results reported in my resume."
    >
      <ul className="grid gap-3">
        {caseStudies.map((c, i) => {
          const open = openId === c.id
          return (
            <li key={c.id} className={`border ${open ? 'border-ink' : 'hairline'}`}>
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`cs-${c.id}`}
                  onClick={() => setOpenId(open ? null : c.id)}
                  className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 p-4 text-left sm:p-6"
                >
                  <span className="font-mono text-sm text-amber-600">0{i + 1}</span>
                  <span>
                    <span className="block font-display text-xl font-bold sm:text-2xl">{c.title}</span>
                    <span className="muted block font-mono text-xs">{c.project}</span>
                  </span>
                  <span aria-hidden className="grid h-8 w-8 place-items-center bg-amber font-bold text-ink">
                    {open ? '–' : '+'}
                  </span>
                </button>
              </h3>
              {open && (
                <div id={`cs-${c.id}`} className="grid gap-8 border-t hairline p-4 sm:p-6 lg:grid-cols-2">
                  <div>
                    <Block label="Challenge"><p className="leading-relaxed">{c.challenge}</p></Block>
                    <Block label="Approach"><List items={c.approach} /></Block>
                  </div>
                  <div>
                    <Block label="Trade-offs"><List items={c.tradeoffs} /></Block>
                    <div className="bg-amber p-5 text-ink">
                      <p className="font-mono text-xs font-bold uppercase tracking-widest">Outcome (from resume)</p>
                      <ul className="mt-2 space-y-2 font-medium">
                        {c.outcome.map((o) => (
                          <li key={o}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="mb-2 font-mono text-xs font-bold uppercase tracking-widest muted">{label}</p>
      {children}
    </div>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((t) => (
        <li key={t} className="flex gap-3 leading-relaxed">
          <span className="mt-2 h-2 w-2 shrink-0 bg-amber" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  )
}
