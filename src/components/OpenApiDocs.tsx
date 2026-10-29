import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { endpoints } from '../content/api'
import { Badge, CodeBlock, Section } from './ui/Section'

const methodColor: Record<string, string> = {
  GET: 'bg-emerald-500 text-ink',
  POST: 'bg-amber text-ink',
  PUT: 'bg-sky-400 text-ink',
  DELETE: 'bg-rose-500 text-white',
}

function buildSpec() {
  const paths: Record<string, Record<string, unknown>> = {}
  for (const e of endpoints) {
    const p = e.path.replace(/\/\d+$/, '/{id}')
    paths[p] ??= {}
    paths[p][e.method.toLowerCase()] = {
      summary: e.summary,
      ...(e.access !== 'public' ? { security: [{ bearerAuth: [] }], 'x-required-role': e.access } : {}),
      ...(e.body ? { requestBody: { content: { 'application/json': { example: e.body } } } } : {}),
      responses: Object.fromEntries(e.responses.map((r) => [String(r.status), { description: r.description }])),
    }
  }
  return {
    openapi: '3.0.3',
    info: { title: 'Course Enrollment API (example)', version: '1.0.0' },
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    paths,
  }
}

export function OpenApiDocs() {
  const [open, setOpen] = useState<string | null>(endpoints[0].id)
  const [raw, setRaw] = useState(false)
  const spec = buildSpec()

  return (
    <Section
      id="docs"
      eyebrow="Documentation"
      title="OpenAPI docs"
      intro="The kind of Swagger/OpenAPI reference I would publish for a Spring Boot API. This is an example that mirrors the simulated playground. It is not generated from a running service."
    >
      <div className="card p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 border-b hairline pb-4">
          <h3 className="font-display text-xl font-bold">Course Enrollment API</h3>
          <span className="font-mono text-xs muted">v1.0.0 · OAS 3.0.3</span>
          <Badge kind="example" />
          <div role="group" aria-label="View" className="ml-auto flex overflow-hidden rounded-sm border hairline text-sm font-semibold">
            <button type="button" aria-pressed={!raw} onClick={() => setRaw(false)} className={`px-3 py-1.5 ${!raw ? 'bg-amber text-ink' : ''}`}>
              Docs
            </button>
            <button type="button" aria-pressed={raw} onClick={() => setRaw(true)} className={`px-3 py-1.5 ${raw ? 'bg-amber text-ink' : ''}`}>
              Raw JSON
            </button>
          </div>
        </div>

        {raw ? (
          <div className="mt-4 max-h-[32rem] overflow-auto">
            <CodeBlock code={JSON.stringify(spec, null, 2)} lang="json" />
          </div>
        ) : (
          <ul className="mt-4 grid gap-2">
            {endpoints.map((e) => {
              const isOpen = open === e.id
              return (
                <li key={e.id} className="border hairline">
                  <h4>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`op-${e.id}`}
                      onClick={() => setOpen(isOpen ? null : e.id)}
                      className="flex w-full flex-wrap items-center gap-3 p-3 text-left"
                    >
                      <span className={`w-16 rounded-sm py-0.5 text-center font-mono text-xs font-bold ${methodColor[e.method]}`}>{e.method}</span>
                      <span className="font-mono text-sm">{e.path.replace(/\/\d+$/, '/{id}')}</span>
                      <span className="muted hidden flex-1 text-sm md:inline">{e.summary}</span>
                      <ChevronDown size={16} className={`ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                    </button>
                  </h4>
                  {isOpen && (
                    <div id={`op-${e.id}`} className="grid gap-5 border-t hairline p-4 md:grid-cols-2">
                      <div>
                        <p className="mb-3 text-sm">{e.summary}</p>
                        <p className="font-mono text-xs uppercase tracking-widest muted">Authorization</p>
                        <p className="mb-4 mt-1 text-sm">
                          {e.access === 'public' ? 'None (public endpoint)' : `Bearer JWT · ${e.access === 'authenticated' ? 'any signed-in user' : `role ${e.access}`}`}
                        </p>
                        {e.body && (
                          <>
                            <p className="mb-1 font-mono text-xs uppercase tracking-widest muted">Request body · application/json</p>
                            <CodeBlock code={JSON.stringify(e.body, null, 2)} lang="json" />
                          </>
                        )}
                      </div>
                      <div>
                        <p className="mb-2 font-mono text-xs uppercase tracking-widest muted">Responses</p>
                        <table className="w-full border-collapse text-sm">
                          <caption className="sr-only">Possible responses</caption>
                          <thead className="sr-only">
                            <tr><th>Status</th><th>Description</th></tr>
                          </thead>
                          <tbody>
                            {e.responses.map((r) => (
                              <tr key={r.status} className="border-b hairline last:border-0">
                                <td className="py-2 pr-4 font-mono font-bold">{r.status}</td>
                                <td className="py-2">{r.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <a href="#playground" className="mt-4 inline-block text-sm font-semibold underline decoration-amber decoration-2 underline-offset-4">
                          Try it in the playground →
                        </a>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Section>
  )
}
