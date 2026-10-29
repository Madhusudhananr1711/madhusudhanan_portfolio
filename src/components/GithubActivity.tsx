import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, GitCommitHorizontal, RefreshCw, Star } from 'lucide-react'
import { profile } from '../content/profile'
import { Badge, Section } from './ui/Section'

interface Repo {
  id: number
  name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
}
interface GhEvent {
  id: string
  type: string
  repo: { name: string }
  created_at: string
  payload: { commits?: unknown[]; size?: number; ref_type?: string }
}

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; repos: Repo[]; events: GhEvent[] }

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function describe(e: GhEvent): string | null {
  const repo = e.repo.name.split('/')[1] ?? e.repo.name
  switch (e.type) {
    case 'PushEvent': {
      const n = e.payload.size ?? e.payload.commits?.length ?? 0
      return `Pushed ${n || ''} commit${n === 1 ? '' : 's'} to ${repo}`.replace('  ', ' ')
    }
    case 'CreateEvent':
      return `Created ${e.payload.ref_type ?? 'item'} in ${repo}`
    case 'PullRequestEvent':
      return `Pull request activity in ${repo}`
    case 'IssuesEvent':
      return `Issue activity in ${repo}`
    default:
      return null
  }
}

export function GithubActivity() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  const load = useCallback((signal: AbortSignal) => {
    setState({ status: 'loading' })
    const base = `https://api.github.com/users/${profile.githubUser}`
    const get = async <T,>(url: string): Promise<T> => {
      const r = await fetch(url, { signal, headers: { Accept: 'application/vnd.github+json' } })
      if (r.status === 403 || r.status === 429) throw new Error('GitHub API rate limit reached. Please try again later.')
      if (!r.ok) throw new Error(`GitHub API responded with ${r.status}.`)
      return r.json() as Promise<T>
    }
    Promise.all([
      get<Repo[]>(`${base}/repos?per_page=100&sort=pushed`),
      get<GhEvent[]>(`${base}/events/public?per_page=30`).catch(() => [] as GhEvent[]),
    ])
      .then(([repos, events]) => setState({ status: 'ready', repos: repos.filter((r) => !r.fork), events }))
      .catch((err: unknown) => {
        if (signal.aborted) return
        setState({ status: 'error', message: err instanceof Error ? err.message : 'Could not reach GitHub.' })
      })
  }, [])

  useEffect(() => {
    const ctrl = new AbortController()
    load(ctrl.signal)
    return () => ctrl.abort()
  }, [load, attempt])

  return (
    <Section
      id="github"
      eyebrow="Open source"
      title="GitHub activity"
      intro="Repositories and recent public activity, fetched live from the GitHub API when you open this page."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Badge kind="live" />
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-2 font-mono text-sm font-semibold underline decoration-amber decoration-2 underline-offset-4"
        >
          github.com/{profile.githubUser} <ExternalLink size={14} />
        </a>
      </div>

      {state.status === 'loading' && (
        <div role="status" className="grid gap-3 md:grid-cols-3" aria-label="Loading GitHub data">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-36 animate-pulse" />
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="card flex flex-wrap items-center gap-4 p-6">
          <p className="flex-1">{state.message} You can still browse the repositories directly on GitHub.</p>
          <button
            type="button"
            onClick={() => setAttempt((a) => a + 1)}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-amber hover:text-ink"
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest muted">Latest repositories</h3>
            {state.repos.length === 0 ? (
              <p className="card p-6">No public repositories found yet.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {state.repos.slice(0, 6).map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="card flex h-full flex-col p-4 transition-colors hover:border-amber"
                    >
                      <span className="flex items-center justify-between gap-2 font-display text-lg font-bold">
                        <span className="truncate">{r.name}</span>
                        <ExternalLink size={14} aria-hidden className="shrink-0" />
                      </span>
                      <span className="muted mt-1 flex-1 text-sm">{r.description ?? 'No description provided.'}</span>
                      <span className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs">
                        {r.language && <span className="bg-ink px-1.5 py-0.5 text-white">{r.language}</span>}
                        <span className="inline-flex items-center gap-1"><Star size={12} aria-hidden /> {r.stargazers_count}</span>
                        <span className="muted">Updated {fmt(r.pushed_at)}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-widest muted">Recent public activity</h3>
            {(() => {
              const items = state.events
                .map((e) => ({ e, text: describe(e) }))
                .filter((x): x is { e: GhEvent; text: string } => x.text !== null)
                .slice(0, 6)
              return items.length === 0 ? (
                <p className="card muted p-6 text-sm">No recent public activity to show.</p>
              ) : (
                <ol className="card divide-y hairline">
                  {items.map(({ e, text }) => (
                    <li key={e.id} className="flex items-start gap-3 p-3 text-sm">
                      <GitCommitHorizontal size={16} className="mt-0.5 shrink-0" aria-hidden />
                      <span className="flex-1">{text}</span>
                      <time dateTime={e.created_at} className="muted shrink-0 font-mono text-xs">{fmt(e.created_at)}</time>
                    </li>
                  ))}
                </ol>
              )
            })()}
          </div>
        </div>
      )}
    </Section>
  )
}
