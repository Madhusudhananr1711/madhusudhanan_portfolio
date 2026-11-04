import { useState } from 'react'
import { ExternalLink, Filter, FolderGit2 } from 'lucide-react'
import { caseStudies } from '../content/caseStudies'
import { projects } from '../content/projects'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Tag } from '../components/ui/Section'

export function CaseStudiesPage() {
  const [selectedProject, setSelectedProject] = useState<string>('ALL')
  const [openIds, setOpenIds] = useState<string[]>(caseStudies.map((c) => c.id))

  const projectNames = Array.from(new Set(caseStudies.map((c) => c.project)))

  const filtered = caseStudies.filter((c) => {
    if (selectedProject === 'ALL') return true
    return c.project === selectedProject
  })

  const toggleOpen = (id: string) => {
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const expandAll = () => setOpenIds(caseStudies.map((c) => c.id))
  const collapseAll = () => setOpenIds([])

  return (
    <div className="surface pt-20 pb-24">
      {/* Header Banner */}
      <div className="bg-ink text-white py-12 px-5 sm:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1440px]">
          <Breadcrumbs items={[{ label: 'Case Studies' }]} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              Engineering Notes
            </span>
            <span className="font-mono text-xs text-white/60">Problems, Trade-offs & Verifiable Outcomes</span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            Technical Case Studies
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Detailed breakdowns of how I approached real-world engineering challenges across backend systems,
            normalized database design, time-series forecasting, and sales analytics.
          </p>

          {/* Project Filter Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/15 pt-6">
            <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amber font-semibold mr-2">
              <Filter size={13} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedProject('ALL')}
              className={`px-3 py-1.5 font-mono text-xs font-bold rounded-sm border transition-colors ${
                selectedProject === 'ALL'
                  ? 'bg-amber text-ink border-amber'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/20'
              }`}
            >
              All Projects ({caseStudies.length})
            </button>
            {projectNames.map((p) => {
              const count = caseStudies.filter((c) => c.project === p).length
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setSelectedProject(p)}
                  className={`px-3 py-1.5 font-mono text-xs font-bold rounded-sm border transition-colors ${
                    selectedProject === p
                      ? 'bg-amber text-ink border-amber'
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/20'
                  }`}
                >
                  {p} ({count})
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 mt-10">
        <div className="flex items-center justify-between gap-4 mb-6 text-xs font-mono">
          <span className="muted">
            Showing {filtered.length} of {caseStudies.length} case studies
          </span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={expandAll} className="muted hover:text-amber transition-colors">
              Expand All
            </button>
            <span className="muted">·</span>
            <button type="button" onClick={collapseAll} className="muted hover:text-amber transition-colors">
              Collapse All
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {filtered.map((c, i) => {
            const isOpen = openIds.includes(c.id)
            const linkedProject = projects.find((p) => p.title.toLowerCase() === c.project.toLowerCase())

            return (
              <div key={c.id} className="card border hairline rounded-sm overflow-hidden">
                {/* Header */}
                <button
                  type="button"
                  onClick={() => toggleOpen(c.id)}
                  aria-expanded={isOpen}
                  className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-4 p-5 sm:p-6 text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-mono text-base font-bold text-amber">0{i + 1}</span>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold leading-snug">{c.title}</h2>
                    <span className="muted block font-mono text-xs mt-0.5">{c.project}</span>
                  </div>
                  <span
                    aria-hidden
                    className="grid h-8 w-8 place-items-center bg-amber font-bold text-ink rounded-sm"
                  >
                    {isOpen ? '–' : '+'}
                  </span>
                </button>

                {/* Expanded Details */}
                {isOpen && (
                  <div className="border-t hairline p-5 sm:p-8 bg-white/5 space-y-8">
                    <div className="grid gap-8 lg:grid-cols-2">
                      {/* Left: Challenge and Approach */}
                      <div className="space-y-6">
                        <div>
                          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber mb-2">
                            The Challenge
                          </p>
                          <p className="text-sm sm:text-base leading-relaxed">{c.challenge}</p>
                        </div>

                        <div>
                          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber mb-2">
                            Engineering Approach
                          </p>
                          <ul className="space-y-2.5">
                            {c.approach.map((step) => (
                              <li key={step} className="flex items-start gap-3 text-sm leading-relaxed">
                                <span className="mt-1.5 h-2 w-2 shrink-0 bg-amber" aria-hidden />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Right: Trade-offs and Verified Outcomes */}
                      <div className="space-y-6">
                        <div>
                          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber mb-2">
                            Architectural Trade-Offs
                          </p>
                          <ul className="space-y-2.5">
                            {c.tradeoffs.map((t) => (
                              <li key={t} className="flex items-start gap-3 text-sm leading-relaxed">
                                <span className="mt-1.5 h-2 w-2 shrink-0 bg-ink dark:bg-white/40" aria-hidden />
                                <span>{t}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Outcomes from Resume */}
                        <div className="bg-amber p-6 text-ink rounded-sm">
                          <p className="font-mono text-xs font-bold uppercase tracking-widest">
                            Outcome (from verified resume)
                          </p>
                          <ul className="mt-3 space-y-2 text-sm font-semibold">
                            {c.outcome.map((o) => (
                              <li key={o} className="flex items-start gap-2.5">
                                <span className="mt-1 font-bold">✓</span>
                                <span>{o}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Footer with Project Link & Tech Stack */}
                    {linkedProject && (
                      <div className="pt-6 border-t hairline flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs muted mr-1">Stack:</span>
                          {linkedProject.stack.slice(0, 5).map((s) => (
                            <Tag key={s}>{s}</Tag>
                          ))}
                        </div>

                        {linkedProject.repoUrl && (
                          <a
                            href={linkedProject.repoUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-amber hover:underline"
                          >
                            <FolderGit2 size={14} />
                            <span>View Project Repository</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
