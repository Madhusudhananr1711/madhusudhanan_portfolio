import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Play, ShieldAlert } from 'lucide-react'
import { exceptionHandler, layers } from '../content/architecture'
import { Badge, CodeBlock, Section } from './ui/Section'

export function ArchitectureDiagram() {
  const [selected, setSelected] = useState(layers[1].id)
  const [trace, setTrace] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)

  // Request goes down the stack, response comes back up: indices 0..n-1 then n-2..0
  const path = [...layers.keys(), ...[...layers.keys()].slice(0, -1).reverse()]

  const runTrace = () => {
    window.clearInterval(timer.current)
    let step = 0
    setTrace(0)
    setSelected(layers[path[0]].id)
    timer.current = window.setInterval(() => {
      step += 1
      if (step >= path.length) {
        window.clearInterval(timer.current)
        setTrace(null)
        return
      }
      setTrace(step)
      setSelected(layers[path[step]].id)
    }, 900)
  }

  useEffect(() => () => window.clearInterval(timer.current), [])

  const layer = layers.find((l) => l.id === selected) ?? layers[0]
  const activeIdx = trace !== null ? path[trace] : -1
  const goingDown = trace !== null && trace < layers.length

  return (
    <Section
      id="architecture"
      eyebrow="System design"
      title="How a request travels"
      intro="The layered structure I use in Spring Boot + React applications. Select a layer, or trace a request down to the database and back."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={runTrace}
              disabled={trace !== null}
              className="inline-flex items-center gap-2 bg-amber px-4 py-2 text-sm font-semibold text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
            >
              <Play size={14} /> {trace !== null ? 'Tracing…' : 'Trace a request'}
            </button>
            {trace !== null && (
              <span className="font-mono text-xs muted" role="status">
                {goingDown ? 'Request ↓' : 'Response ↑'}
              </span>
            )}
          </div>

          <ol className="space-y-0">
            {layers.map((l, i) => {
              const isSel = l.id === selected
              const isTrace = i === activeIdx
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(l.id)}
                    aria-pressed={isSel}
                    className={`w-full border-2 p-4 text-left transition-all ${
                      isTrace
                        ? 'border-amber bg-amber text-ink'
                        : isSel
                          ? 'border-ink bg-ink text-white'
                          : 'hairline card hover:border-amber'
                    }`}
                  >
                    <span className="block font-display text-lg font-bold">{l.name}</span>
                    <span className={`block font-mono text-xs ${isSel && !isTrace ? 'text-amber' : 'opacity-70'}`}>{l.tech}</span>
                  </button>
                  {i < layers.length - 1 && (
                    <div className="flex justify-center py-1 muted" aria-hidden>
                      <ArrowDown size={18} />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="card mt-4 flex gap-3 border-dashed p-4">
            <ShieldAlert size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-display font-bold">{exceptionHandler.name}</p>
              <p className="font-mono text-xs muted">{exceptionHandler.tech}</p>
              <p className="muted mt-2 text-sm leading-relaxed">{exceptionHandler.description}</p>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-display text-3xl font-bold">{layer.name}</h3>
            <Badge kind="example" />
          </div>
          <p className="mt-2 text-lg">{layer.role}</p>
          <ul className="mt-5 space-y-3">
            {layer.responsibilities.map((r) => (
              <li key={r} className="flex gap-3 leading-relaxed">
                <span className="mt-2 h-2 w-2 shrink-0 bg-amber" aria-hidden />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-6 mb-2 font-mono text-xs uppercase tracking-widest muted">
            Illustrative {layer.lang === 'ts' ? 'TypeScript' : layer.lang === 'java' ? 'Java' : 'SQL'} snippet
          </p>
          <CodeBlock code={layer.snippet} lang={layer.lang} />
        </div>
      </div>
    </Section>
  )
}
