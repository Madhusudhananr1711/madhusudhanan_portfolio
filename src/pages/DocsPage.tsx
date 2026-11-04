import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  ChevronDown,
  Copy,
  Download,
  Play,
  Search,
} from 'lucide-react'
import { endpoints, type Endpoint, type Method } from '../content/api'
import { buildOpenApiSpec } from '../lib/openApiSpec'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Badge, CodeBlock } from '../components/ui/Section'

export { buildOpenApiSpec }

const methodColors: Record<Method, string> = {
  GET: 'bg-emerald-500 text-ink',
  POST: 'bg-amber text-ink',
  PUT: 'bg-sky-400 text-ink',
  DELETE: 'bg-rose-500 text-white',
}

export function DocsPage() {
  const [activeView, setActiveView] = useState<'ui' | 'raw'>('ui')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL')
  const [expandedIds, setExpandedIds] = useState<string[]>([endpoints[0].id, endpoints[1].id])
  const [copiedCurlId, setCopiedCurlId] = useState<string | null>(null)
  const [copiedSpec, setCopiedSpec] = useState(false)

  const spec = useMemo(() => buildOpenApiSpec(), [])

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const expandAll = () => setExpandedIds(endpoints.map((e) => e.id))
  const collapseAll = () => setExpandedIds([])

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((e) => {
      const matchesSearch =
        e.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.tag.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesMethod = selectedMethod === 'ALL' || e.method === selectedMethod
      return matchesSearch && matchesMethod
    })
  }, [searchQuery, selectedMethod])

  // Group endpoints by tag
  const grouped = useMemo(() => {
    const map = new Map<string, Endpoint[]>()
    for (const e of filteredEndpoints) {
      const list = map.get(e.tag) || []
      list.push(e)
      map.set(e.tag, list)
    }
    return Array.from(map.entries())
  }, [filteredEndpoints])

  const copyCurl = (e: Endpoint) => {
    let curl = `curl -X ${e.method} "https://portfolio-api.demo${e.path}"`
    if (e.access !== 'public') {
      curl += ` \\\n  -H "Authorization: Bearer <TOKEN>"`
    }
    if (e.body) {
      curl += ` \\\n  -H "Content-Type: application/json"`
      curl += ` \\\n  -d '${JSON.stringify(e.body)}'`
    }
    navigator.clipboard.writeText(curl)
    setCopiedCurlId(e.id)
    setTimeout(() => setCopiedCurlId(null), 2000)
  }

  const handleCopySpec = () => {
    navigator.clipboard.writeText(JSON.stringify(spec, null, 2))
    setCopiedSpec(true)
    setTimeout(() => setCopiedSpec(false), 2000)
  }

  const handleDownloadSpec = () => {
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'openapi-spec.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="surface pt-20 pb-24">
      {/* Header Banner */}
      <div className="bg-ink text-white py-12 px-5 sm:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1440px]">
          <Breadcrumbs items={[{ label: 'API Documentation' }]} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              OpenAPI 3.0.3 Contract
            </span>
            <Badge kind="example" />
            <span className="font-mono text-xs text-white/60">Ready for Swagger UI / Postman Import</span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            API Documentation & Reference
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Detailed API contracts for both the Spring Boot Course Enrollment service and the Python
            Patient-Flow time-series endpoints, including request parameter schemas, required role authorities, and JSON response contracts.
          </p>

          {/* Action Toolbar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6">
            {/* View Mode Switcher */}
            <div className="flex border border-white/20 rounded-sm overflow-hidden text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setActiveView('ui')}
                className={`px-4 py-2 transition-colors ${
                  activeView === 'ui' ? 'bg-amber text-ink' : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                Interactive Reference
              </button>
              <button
                type="button"
                onClick={() => setActiveView('raw')}
                className={`px-4 py-2 transition-colors ${
                  activeView === 'raw' ? 'bg-amber text-ink' : 'bg-white/5 hover:bg-white/10 text-white'
                }`}
              >
                Raw OpenAPI JSON Spec
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySpec}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs font-mono font-medium px-3.5 py-2 border border-white/20 rounded-sm transition-colors text-white"
              >
                {copiedSpec ? <Check size={14} className="text-amber" /> : <Copy size={14} />}
                <span>{copiedSpec ? 'Copied Spec' : 'Copy OAS Spec'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSpec}
                className="inline-flex items-center gap-1.5 bg-amber hover:bg-amber/90 text-xs font-mono font-bold px-3.5 py-2 rounded-sm text-ink transition-colors"
              >
                <Download size={14} />
                <span>Export openapi.json</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 mt-10">
        {activeView === 'raw' ? (
          <div className="card p-6 hairline">
            <div className="flex items-center justify-between border-b hairline pb-4 mb-4">
              <div>
                <h2 className="font-display text-xl font-bold">OpenAPI 3.0.3 Specification Document</h2>
                <p className="font-mono text-xs muted mt-1">
                  Standard OpenAPI 3.0 document ready to import into Postman, Insomnia, or Swagger UI.
                </p>
              </div>
            </div>
            <div className="max-h-[38rem] overflow-auto">
              <CodeBlock code={JSON.stringify(spec, null, 2)} lang="json" />
            </div>
          </div>
        ) : (
          <div>
            {/* Filter and Search Bar */}
            <div className="card p-4 hairline mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 muted" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by endpoint path, summary, or tag…"
                  className="w-full border hairline bg-transparent pl-9 pr-4 py-2 font-mono text-xs rounded-sm focus:border-amber"
                />
              </div>

              {/* Method Filters */}
              <div className="flex items-center gap-1.5">
                {['ALL', 'GET', 'POST', 'DELETE'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMethod(m)}
                    className={`px-2.5 py-1 font-mono text-xs font-bold rounded-sm border ${
                      selectedMethod === m ? 'bg-ink text-white border-ink' : 'hairline card hover:border-amber'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Expand / Collapse Toggle */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={expandAll}
                  className="muted hover:text-amber transition-colors"
                >
                  Expand All
                </button>
                <span className="muted">·</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="muted hover:text-amber transition-colors"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Endpoints Grouped by Tag */}
            {grouped.length === 0 ? (
              <div className="card p-12 text-center muted hairline">
                <p>No endpoints match the filter criteria.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {grouped.map(([tag, list]) => (
                  <div key={tag}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{tag}</h2>
                      <span className="font-mono text-xs muted bg-white/5 px-2 py-0.5 rounded-sm border hairline">
                        {list.length} endpoint{list.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {list.map((e) => {
                        const isExpanded = expandedIds.includes(e.id)
                        const isCopied = copiedCurlId === e.id

                        return (
                          <div key={e.id} className="card border hairline rounded-sm overflow-hidden">
                            {/* Collapsible Accordion Header */}
                            <h3>
                              <button
                                type="button"
                                onClick={() => toggleExpand(e.id)}
                                aria-expanded={isExpanded}
                                className="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left hover:bg-white/5 transition-colors"
                              >
                                <div className="flex flex-wrap items-center gap-3">
                                  <span
                                    className={`w-16 rounded-sm py-0.5 text-center font-mono text-xs font-bold ${methodColors[e.method]}`}
                                  >
                                    {e.method}
                                  </span>
                                  <span className="font-mono text-sm font-semibold">
                                    {e.path.replace(/\/\d+$/, '/{id}')}
                                  </span>
                                  <span className="muted hidden sm:inline text-xs truncate max-w-md">
                                    — {e.summary}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3 ml-auto">
                                  <span
                                    className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-sm ${
                                      e.access === 'public'
                                        ? 'bg-white/10 text-foreground'
                                        : 'bg-ink text-amber'
                                    }`}
                                  >
                                    {e.access === 'public' ? 'Public' : `Bearer · ${e.access}`}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-amber' : 'muted'}`}
                                  />
                                </div>
                              </button>
                            </h3>

                            {/* Expanded Details Body */}
                            {isExpanded && (
                              <div className="p-5 border-t hairline bg-white/5 space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                  <p className="text-sm leading-relaxed max-w-3xl">{e.description}</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => copyCurl(e)}
                                      className="inline-flex items-center gap-1.5 text-xs font-mono font-medium border hairline px-2.5 py-1.5 rounded-sm hover:border-amber transition-colors"
                                    >
                                      {isCopied ? <Check size={13} className="text-amber" /> : <Copy size={13} />}
                                      <span>{isCopied ? 'Copied' : 'Copy cURL'}</span>
                                    </button>

                                    <Link
                                      to={`/api-playground?endpoint=${e.id}`}
                                      className="inline-flex items-center gap-1.5 bg-amber px-3 py-1.5 text-xs font-mono font-bold text-ink rounded-sm hover:bg-amber/90 transition-colors"
                                    >
                                      <Play size={12} />
                                      <span>Try in Playground</span>
                                    </Link>
                                  </div>
                                </div>

                                {/* Parameters Section */}
                                {e.parameters && e.parameters.length > 0 && (
                                  <div>
                                    <h4 className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-2">
                                      Request Parameters
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left text-xs font-mono border-collapse">
                                        <thead>
                                          <tr className="border-b hairline muted">
                                            <th className="py-2 pr-4">Parameter</th>
                                            <th className="py-2 pr-4">Location</th>
                                            <th className="py-2 pr-4">Type</th>
                                            <th className="py-2 pr-4">Required</th>
                                            <th className="py-2">Description</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y hairline">
                                          {e.parameters.map((p) => (
                                            <tr key={p.name}>
                                              <td className="py-2 pr-4 font-bold text-foreground">{p.name}</td>
                                              <td className="py-2 pr-4 muted">{p.in}</td>
                                              <td className="py-2 pr-4 text-amber">{p.type}</td>
                                              <td className="py-2 pr-4">{p.required ? 'Yes' : 'No'}</td>
                                              <td className="py-2">{p.description}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                )}

                                {/* Request Body & Response Contracts Grid */}
                                <div className="grid gap-6 md:grid-cols-2">
                                  {/* Request Body */}
                                  <div>
                                    <h4 className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-2">
                                      Request Schema & Example
                                    </h4>
                                    {e.body ? (
                                      <div className="space-y-3">
                                        {e.bodySchema && (
                                          <div className="text-xs font-mono space-y-1 p-3 bg-ink text-white rounded-sm border hairline">
                                            {Object.entries(e.bodySchema).map(([field, schema]) => (
                                              <div key={field} className="flex justify-between">
                                                <span className="text-amber font-bold">
                                                  {field} {schema.required && '*'}
                                                </span>
                                                <span className="text-white/60 text-[11px]">{schema.type}</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                        <CodeBlock code={JSON.stringify(e.body, null, 2)} lang="json" />
                                      </div>
                                    ) : (
                                      <p className="text-xs muted italic">No request body required for this operation.</p>
                                    )}
                                  </div>

                                  {/* Responses */}
                                  <div>
                                    <h4 className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-2">
                                      Responses & Status Codes
                                    </h4>
                                    <ul className="space-y-2">
                                      {e.responses.map((r) => (
                                        <li key={r.status} className="border hairline p-3 rounded-sm bg-ink/40">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-amber">{r.status}</span>
                                            <span className="text-xs font-medium">{r.description}</span>
                                          </div>
                                          {r.example != null ? (
                                            <div className="mt-2 max-h-36 overflow-auto">
                                              <CodeBlock code={JSON.stringify(r.example, null, 2)} lang="json" />
                                            </div>
                                          ) : null}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
