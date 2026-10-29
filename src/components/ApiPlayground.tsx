import { useState } from 'react'
import { RotateCcw, Send } from 'lucide-react'
import { endpoints, sampleUsers, type Endpoint } from '../content/api'
import { handleRequest, newDb, readDemoToken, type MockResponse } from '../lib/mockApi'
import { Badge, CodeBlock, Section } from './ui/Section'

const methodColor: Record<string, string> = {
  GET: 'bg-emerald-500 text-ink',
  POST: 'bg-amber text-ink',
  PUT: 'bg-sky-400 text-ink',
  DELETE: 'bg-rose-500 text-white',
}

const statusTone = (s: number) =>
  s < 300 ? 'bg-emerald-500 text-ink' : s < 400 ? 'bg-sky-400 text-ink' : s < 500 ? 'bg-amber text-ink' : 'bg-rose-500 text-white'

interface HistoryItem {
  id: number
  method: string
  path: string
  status: number
}

export function ApiPlayground() {
  const [db, setDb] = useState(newDb)
  const [endpointId, setEndpointId] = useState(endpoints[0].id)
  const [method, setMethod] = useState<string>(endpoints[0].method)
  const [path, setPath] = useState(endpoints[0].path)
  const [body, setBody] = useState(JSON.stringify(endpoints[0].body ?? {}, null, 2))
  const [token, setToken] = useState('')
  const [res, setRes] = useState<MockResponse | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const principal = token ? readDemoToken(token) : null
  const hasBody = method === 'POST' || method === 'PUT'

  const pick = (e: Endpoint) => {
    setEndpointId(e.id)
    setMethod(e.method)
    setPath(e.path)
    setBody(e.body ? JSON.stringify(e.body, null, 2) : '')
  }

  const send = () => {
    const response = handleRequest({ method, path, token, bodyText: hasBody ? body : '' }, db)
    setDb({ ...db }) // handler mutates in place; trigger a re-render
    setRes(response)
    setHistory((h) => [{ id: Date.now() + Math.random(), method, path, status: response.status }, ...h].slice(0, 6))
    const b = response.body as { accessToken?: string } | null
    if (response.status === 200 && b && typeof b === 'object' && b.accessToken) setToken(b.accessToken)
  }

  const reset = () => {
    setDb(newDb())
    setToken('')
    setRes(null)
    setHistory([])
  }

  const selected = endpoints.find((e) => e.id === endpointId)

  return (
    <Section
      id="playground"
      eyebrow="Try it"
      title="API playground"
      intro="A safe, in-browser simulation of a JWT-secured Spring-style API. Log in as a student or an admin, then try endpoints to see 200, 201, 400, 401, 403, 404 and 409 responses. No network requests are made."
    >
      <div className="card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 border-b hairline pb-4">
          <div role="group" aria-label="Request mode" className="flex overflow-hidden rounded-sm border hairline text-sm font-semibold">
            <span className="bg-amber px-3 py-1.5 text-ink">Simulated</span>
            <button
              type="button"
              disabled
              title="No live backend is deployed for this portfolio yet"
              className="muted cursor-not-allowed px-3 py-1.5 line-through decoration-1"
            >
              Live
            </button>
          </div>
          <Badge kind="simulated" />
          <span className="muted text-sm">Responses are generated in your browser from sample data.</span>
          <button
            type="button"
            onClick={reset}
            className="ml-auto inline-flex items-center gap-2 border hairline px-3 py-1.5 text-sm font-medium hover:border-amber"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-widest muted">Endpoints</p>
            <ul className="grid gap-1.5">
              {endpoints.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => pick(e)}
                    aria-pressed={e.id === endpointId}
                    className={`flex w-full items-center gap-2 border p-2 text-left text-sm transition-colors ${
                      e.id === endpointId ? 'border-ink bg-ink text-white' : 'hairline hover:border-amber'
                    }`}
                  >
                    <span className={`w-14 shrink-0 rounded-sm px-1 py-0.5 text-center font-mono text-[10px] font-bold ${methodColor[e.method]}`}>
                      {e.method}
                    </span>
                    <span className="truncate font-mono text-xs">{e.path}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-5 border hairline p-3 text-sm">
              <p className="font-mono text-xs uppercase tracking-widest muted">Session</p>
              {principal ? (
                <p className="mt-1">
                  Signed in as <strong className="break-all">{principal.sub}</strong>{' '}
                  <span className="bg-ink px-1.5 py-0.5 font-mono text-[11px] text-amber">{principal.role}</span>
                </p>
              ) : (
                <p className="muted mt-1">Not signed in. Send the login request to get a token.</p>
              )}
              <p className="muted mt-3 text-xs">Sample users (password Password@123):</p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {sampleUsers.map((u) => (
                  <li key={u.email}>
                    <button
                      type="button"
                      onClick={() => {
                        const login = endpoints[0]
                        pick(login)
                        setBody(JSON.stringify({ email: u.email, password: u.password }, null, 2))
                      }}
                      className="border hairline px-2 py-1 font-mono text-[11px] hover:border-amber"
                    >
                      {u.role.toLowerCase()}
                    </button>
                  </li>
                ))}
              </ul>
              {token && (
                <button type="button" onClick={() => setToken('')} className="mt-3 text-xs underline">
                  Clear token (simulate logged-out)
                </button>
              )}
            </div>
          </div>

          <div className="min-w-0">
            {selected && <p className="muted mb-3 text-sm">{selected.summary} Access: <strong>{selected.access}</strong></p>}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="flex flex-wrap gap-2"
            >
              <label className="sr-only" htmlFor="pg-method">HTTP method</label>
              <select
                id="pg-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border hairline bg-transparent px-2 py-2 font-mono text-sm font-bold"
              >
                {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                  <option key={m} className="text-ink">{m}</option>
                ))}
              </select>
              <label className="sr-only" htmlFor="pg-path">Request path</label>
              <input
                id="pg-path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                spellCheck={false}
                className="min-w-0 flex-1 border hairline bg-transparent px-3 py-2 font-mono text-sm"
              />
              <button type="submit" className="inline-flex items-center gap-2 bg-ink px-5 py-2 font-semibold text-white transition-colors hover:bg-amber hover:text-ink">
                <Send size={15} /> Send
              </button>
            </form>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="min-w-0">
                <p className="mb-1 font-mono text-xs uppercase tracking-widest muted">Request</p>
                <p className="mb-2 truncate font-mono text-[11px] muted" title={token}>
                  Authorization: {token ? `Bearer ${token.slice(0, 28)}…` : '(none)'}
                </p>
                <label className="sr-only" htmlFor="pg-body">JSON request body</label>
                <textarea
                  id="pg-body"
                  value={hasBody ? body : ''}
                  onChange={(e) => setBody(e.target.value)}
                  disabled={!hasBody}
                  placeholder={hasBody ? '{ }' : `${method} requests have no body`}
                  spellCheck={false}
                  rows={9}
                  className="w-full resize-y border hairline bg-transparent p-3 font-mono text-[12.5px] leading-relaxed disabled:opacity-50"
                />
              </div>

              <div className="min-w-0" aria-live="polite">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <p className="font-mono text-xs uppercase tracking-widest muted">Response</p>
                  {res && (
                    <>
                      <span className={`rounded-sm px-2 py-0.5 font-mono text-xs font-bold ${statusTone(res.status)}`}>
                        {res.status} {res.statusText}
                      </span>
                      <span className="font-mono text-[11px] muted">{res.ms} ms · simulated</span>
                    </>
                  )}
                </div>
                {res ? (
                  <CodeBlock code={res.body === null ? '(empty body)' : JSON.stringify(res.body, null, 2)} lang="json" />
                ) : (
                  <div className="muted grid min-h-[11rem] place-items-center border border-dashed hairline p-4 text-center text-sm">
                    Send a request to see the response.
                  </div>
                )}
              </div>
            </div>

            {history.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 font-mono text-xs uppercase tracking-widest muted">Recent requests</p>
                <ul className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <li key={h.id} className="flex items-center gap-2 border hairline px-2 py-1 font-mono text-[11px]">
                      <span className={`rounded-sm px-1 ${statusTone(h.status)}`}>{h.status}</span>
                      {h.method} {h.path}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  )
}
