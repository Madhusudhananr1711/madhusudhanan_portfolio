import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Check,
  Clock,
  Copy,
  Info,
  Play,
  RotateCcw,
  Send,
  Terminal,
  Trash2,
} from 'lucide-react'
import { endpoints, sampleUsers, type Endpoint, type Method } from '../content/api'
import { handleRequest, newDb, readDemoToken, type Db, type MockResponse } from '../lib/mockApi'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Badge, CodeBlock } from '../components/ui/Section'

const methodColors: Record<Method, string> = {
  GET: 'bg-emerald-500 text-ink',
  POST: 'bg-amber text-ink',
  PUT: 'bg-sky-400 text-ink',
  DELETE: 'bg-rose-500 text-white',
}

const statusTones = (status: number) => {
  if (status < 300) return 'bg-emerald-500 text-ink'
  if (status < 400) return 'bg-sky-400 text-ink'
  if (status < 500) return 'bg-amber text-ink'
  return 'bg-rose-500 text-white'
}

interface RequestHistoryItem {
  id: string
  method: string
  path: string
  status: number
  ms: number
  timestamp: string
}

export function ApiPlaygroundPage() {
  const [searchParams] = useSearchParams()
  const initialEndpointId = searchParams.get('endpoint') || endpoints[0].id

  const [db, setDb] = useState<Db>(newDb)
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>(initialEndpointId)
  const [method, setMethod] = useState<Method>(endpoints[0].method)
  const [path, setPath] = useState<string>(endpoints[0].path)
  const [bodyText, setBodyText] = useState<string>(
    endpoints[0].body ? JSON.stringify(endpoints[0].body, null, 2) : '',
  )
  const [token, setToken] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [response, setResponse] = useState<MockResponse | null>(null)
  const [history, setHistory] = useState<RequestHistoryItem[]>([])
  const [copiedCurl, setCopiedCurl] = useState(false)
  const [copiedResponse, setCopiedResponse] = useState(false)

  // Sync endpoint from query param if available
  useEffect(() => {
    const target = endpoints.find((e) => e.id === searchParams.get('endpoint'))
    if (target) {
      pickEndpoint(target)
    }
  }, [searchParams])

  const principal = token ? readDemoToken(token) : null
  const hasBody = method === 'POST' || method === 'PUT'

  const pickEndpoint = (e: Endpoint) => {
    setSelectedEndpointId(e.id)
    setMethod(e.method)
    setPath(e.path)
    setBodyText(e.body ? JSON.stringify(e.body, null, 2) : '')
  }

  const sendRequest = async () => {
    setIsLoading(true)
    // Simulate natural microsecond processing / network roundtrip
    await new Promise((resolve) => setTimeout(resolve, 80 + Math.random() * 60))

    const res = handleRequest({ method, path, token, bodyText: hasBody ? bodyText : '' }, db)
    setDb({ ...db }) // trigger re-render on database changes
    setResponse(res)
    setIsLoading(false)

    // Append to history
    setHistory((prev) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        method,
        path,
        status: res.status,
        ms: res.ms,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 7),
    ])

    // If login was successful, auto-populate token for smooth testing
    if (path === '/api/auth/login' && res.status === 200 && res.body && typeof res.body === 'object') {
      const b = res.body as { accessToken?: string }
      if (b.accessToken) {
        setToken(b.accessToken)
      }
    }
  }

  const resetAll = () => {
    setDb(newDb())
    setToken('')
    setResponse(null)
    setHistory([])
    pickEndpoint(endpoints[0])
  }

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(bodyText)
      setBodyText(JSON.stringify(parsed, null, 2))
    } catch {
      // Keep as-is if invalid
    }
  }

  const handleCopyCurl = () => {
    let curl = `curl -X ${method} "https://portfolio-api.demo${path}"`
    if (token) {
      curl += ` \\\n  -H "Authorization: Bearer ${token}"`
    }
    if (hasBody && bodyText.trim()) {
      curl += ` \\\n  -H "Content-Type: application/json"`
      curl += ` \\\n  -d '${bodyText.replace(/'/g, "\\'")}'`
    }
    navigator.clipboard.writeText(curl)
    setCopiedCurl(true)
    setTimeout(() => setCopiedCurl(false), 2000)
  }

  const handleCopyResponse = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response.body, null, 2))
    setCopiedResponse(true)
    setTimeout(() => setCopiedResponse(false), 2000)
  }

  const currentEndpoint = endpoints.find((e) => e.id === selectedEndpointId)

  return (
    <div className="surface pt-20 pb-24">
      {/* Page Header */}
      <div className="bg-ink text-white py-12 px-5 sm:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1440px]">
          <Breadcrumbs items={[{ label: 'API Playground' }]} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              Interactive Workbench
            </span>
            <Badge kind="simulated" />
            <span className="font-mono text-xs text-white/60">Zero External Credentials Needed</span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            REST API Playground
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Test and simulate endpoints for the Course Enrollment and Hospital Patient-Flow systems.
            Authenticate with mock roles, inspect JWT headers, send customized JSON payloads, and verify status codes.
          </p>

          {/* Quick Preset Scenarios */}
          <div className="mt-8 pt-6 border-t border-white/15">
            <p className="font-mono text-xs uppercase tracking-wider text-amber font-semibold mb-3">
              One-Click Testing Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {sampleUsers.map((u) => (
                <button
                  key={u.role}
                  type="button"
                  onClick={() => {
                    const loginEndpoint = endpoints[0]
                    pickEndpoint(loginEndpoint)
                    setBodyText(JSON.stringify({ email: u.email, password: u.password }, null, 2))
                  }}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-mono font-medium px-3 py-2 border border-white/20 rounded-sm transition-colors"
                >
                  <Play size={11} className="text-amber" />
                  <span>Log in as {u.label}</span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setToken('')
                  const protectedCourse = endpoints[1]
                  pickEndpoint(protectedCourse)
                }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-mono font-medium px-3 py-2 border border-white/20 rounded-sm transition-colors text-amber"
              >
                Simulate 401 (Logged Out)
              </button>

              <button
                type="button"
                onClick={() => {
                  const createCourse = endpoints[3]
                  pickEndpoint(createCourse)
                  setBodyText(JSON.stringify({ title: 'A', capacity: 9999 }, null, 2))
                }}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-xs font-mono font-medium px-3 py-2 border border-white/20 rounded-sm transition-colors"
              >
                Simulate 400 (Bad Validation)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workbench Layout */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 mt-10">
        {/* Safe Sandbox Notice Banner */}
        <div className="card p-4 mb-8 flex flex-wrap items-center justify-between gap-4 hairline border-l-4 border-amber">
          <div className="flex items-center gap-3">
            <Info size={20} className="text-amber shrink-0" />
            <p className="text-xs sm:text-sm text-foreground/80">
              <strong>Simulated in-browser data.</strong> Responses are generated locally via the mock handler; no live database or server secrets are exposed.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 border hairline px-3 py-1.5 text-xs font-mono font-medium hover:border-amber transition-colors rounded-sm"
          >
            <RotateCcw size={13} /> Reset Database State
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[300px_1fr] items-start">
          {/* Left Column: Endpoints & Session Inspector */}
          <div className="space-y-6">
            {/* Endpoints Navigator */}
            <div className="card p-4 hairline">
              <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-3">
                Endpoint Directory
              </p>
              <ul className="space-y-1.5">
                {endpoints.map((e) => {
                  const isSelected = e.id === selectedEndpointId
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => pickEndpoint(e)}
                        aria-pressed={isSelected}
                        className={`flex w-full items-center gap-2 border p-2.5 text-left text-xs transition-all rounded-sm ${
                          isSelected
                            ? 'border-ink bg-ink text-white font-semibold shadow-sm'
                            : 'hairline card hover:border-amber'
                        }`}
                      >
                        <span
                          className={`w-14 shrink-0 rounded-sm px-1.5 py-0.5 text-center font-mono text-[10px] font-bold ${methodColors[e.method]}`}
                        >
                          {e.method}
                        </span>
                        <span className="truncate font-mono">{e.path}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Session & Authentication Panel */}
            <div className="card p-4 hairline">
              <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-2">
                Active Client Session
              </p>
              {principal ? (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-ink text-white rounded-sm">
                    <p className="text-white/60 text-[11px]">Authenticated as:</p>
                    <p className="font-mono font-bold text-amber break-all mt-0.5">{principal.sub}</p>
                    <p className="mt-1 inline-block font-mono text-[10px] font-bold bg-amber text-ink px-2 py-0.5 rounded-sm">
                      ROLE_{principal.role}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToken('')}
                    className="w-full text-center text-xs font-mono text-rose-500 hover:underline pt-1"
                  >
                    Clear Token (Log Out)
                  </button>
                </div>
              ) : (
                <div className="text-xs muted space-y-2">
                  <p>Not signed in. Submit the login request to obtain a simulated JWT token.</p>
                </div>
              )}
            </div>

            {/* Request History */}
            {history.length > 0 && (
              <div className="card p-4 hairline">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
                    Request History
                  </p>
                  <button
                    type="button"
                    onClick={() => setHistory([])}
                    className="text-xs muted hover:text-amber"
                    title="Clear history"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <ul className="space-y-1.5 text-xs font-mono">
                  {history.map((h) => (
                    <li
                      key={h.id}
                      className="flex items-center justify-between p-2 border hairline rounded-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`px-1 py-0.5 rounded-sm text-[10px] font-bold ${statusTones(h.status)}`}>
                          {h.status}
                        </span>
                        <span className="font-bold">{h.method}</span>
                        <span className="truncate muted text-[11px]">{h.path}</span>
                      </div>
                      <span className="shrink-0 text-[10px] muted">{h.ms}ms</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Request & Response Console */}
          <div className="card p-6 hairline">
            {/* Summary & Access level */}
            {currentEndpoint && (
              <div className="mb-4 pb-4 border-b hairline flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-bold">{currentEndpoint.summary}</h3>
                  <p className="text-xs text-foreground/70 mt-1">{currentEndpoint.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs muted">Required Access:</span>
                  <span className="font-mono text-xs font-bold text-amber bg-ink px-2 py-0.5 rounded-sm">
                    {currentEndpoint.access}
                  </span>
                </div>
              </div>
            )}

            {/* Request Line: Method + URL + Send */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendRequest()
              }}
              className="flex flex-wrap gap-2"
            >
              <label htmlFor="http-method-select" className="sr-only">HTTP Method</label>
              <select
                id="http-method-select"
                value={method}
                onChange={(e) => setMethod(e.target.value as Method)}
                className="border hairline bg-transparent px-3 py-2.5 font-mono text-sm font-bold rounded-sm focus:border-amber"
              >
                {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                  <option key={m} value={m} className="text-ink">
                    {m}
                  </option>
                ))}
              </select>

              <label htmlFor="http-path-input" className="sr-only">Request Path</label>
              <input
                id="http-path-input"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                spellCheck={false}
                placeholder="/api/courses"
                className="min-w-0 flex-1 border hairline bg-transparent px-4 py-2.5 font-mono text-sm rounded-sm focus:border-amber"
              />

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-ink px-6 py-2.5 font-semibold text-white transition-all hover:bg-amber hover:text-ink disabled:opacity-50 rounded-sm"
              >
                {isLoading ? (
                  <>
                    <Clock size={16} className="animate-spin" /> Processing…
                  </>
                ) : (
                  <>
                    <Send size={15} /> Send Request
                  </>
                )}
              </button>
            </form>

            {/* Permitted Headers Banner */}
            <div className="mt-4 p-3 bg-white/5 border hairline text-xs font-mono flex flex-wrap items-center justify-between gap-3 rounded-sm">
              <div className="truncate flex items-center gap-2">
                <span className="muted">Authorization:</span>
                <span className={token ? 'text-amber font-semibold truncate' : 'muted italic'}>
                  {token ? `Bearer ${token.slice(0, 32)}…` : '(none)'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyCurl}
                className="inline-flex items-center gap-1.5 text-xs text-amber hover:underline shrink-0"
              >
                {copiedCurl ? <Check size={13} /> : <Copy size={13} />}
                {copiedCurl ? 'Copied cURL' : 'Copy cURL'}
              </button>
            </div>

            {/* Request Body & Parameters Editor */}
            <div className="mt-6">
              <div className="flex items-center justify-between border-b hairline pb-2">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
                    Request Payload
                  </span>
                  {!hasBody && (
                    <span className="font-mono text-xs muted italic">
                      ({method} requests do not transmit a request body)
                    </span>
                  )}
                </div>
                {hasBody && (
                  <button
                    type="button"
                    onClick={handlePrettify}
                    className="text-xs font-mono text-amber hover:underline"
                  >
                    Format JSON
                  </button>
                )}
              </div>

              <textarea
                value={hasBody ? bodyText : ''}
                onChange={(e) => setBodyText(e.target.value)}
                disabled={!hasBody}
                rows={7}
                placeholder={hasBody ? '{\n  "title": "Example Course",\n  "capacity": 30\n}' : 'No body required for this method.'}
                spellCheck={false}
                className="mt-3 w-full border hairline bg-transparent p-3 font-mono text-xs leading-relaxed rounded-sm focus:border-amber disabled:opacity-40"
              />
            </div>

            {/* Response Section */}
            <div className="mt-8 border-t hairline pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
                    Response
                  </p>
                  {response && (
                    <>
                      <span className={`px-2.5 py-0.5 rounded-sm font-mono text-xs font-bold ${statusTones(response.status)}`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="font-mono text-xs muted flex items-center gap-1">
                        <Clock size={12} /> {response.ms} ms
                      </span>
                    </>
                  )}
                </div>

                {response && (
                  <div className="flex items-center gap-3">
                    {/* Body / Headers Tab toggle */}
                    <div className="flex border hairline rounded-sm overflow-hidden text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setActiveTab('body')}
                        className={`px-3 py-1 font-semibold ${
                          activeTab === 'body' ? 'bg-amber text-ink' : 'hover:bg-white/5'
                        }`}
                      >
                        Body
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('headers')}
                        className={`px-3 py-1 font-semibold ${
                          activeTab === 'headers' ? 'bg-amber text-ink' : 'hover:bg-white/5'
                        }`}
                      >
                        Headers
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyResponse}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-amber hover:underline"
                    >
                      {copiedResponse ? <Check size={13} /> : <Copy size={13} />}
                      {copiedResponse ? 'Copied' : 'Copy JSON'}
                    </button>
                  </div>
                )}
              </div>

              {response ? (
                activeTab === 'body' ? (
                  <div className="max-h-[28rem] overflow-auto">
                    <CodeBlock
                      code={response.body === null ? '(204 No Content - Empty Body)' : JSON.stringify(response.body, null, 2)}
                      lang="json"
                    />
                  </div>
                ) : (
                  <div className="p-4 border hairline bg-ink text-white font-mono text-xs space-y-1.5 rounded-sm">
                    {Object.entries(response.headers).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-amber font-semibold">{k}:</span>
                        <span className="text-white/80">{v}</span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="muted grid min-h-[12rem] place-items-center border border-dashed hairline p-6 text-center text-sm rounded-sm">
                  <div className="max-w-sm">
                    <Terminal size={28} className="mx-auto mb-2 opacity-40" />
                    <p>Select an endpoint or click <strong>Send Request</strong> to execute an in-browser simulated API call.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
