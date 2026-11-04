import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  Check,
  Code,
  Copy,
  Layers,
  Play,
  RotateCcw,
  Shield,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  courseEnrollmentSystem,
  hospitalPatientFlowSystem,
  type ArchitectureSystem,
} from '../content/architecture'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { Badge, CodeBlock, Tag } from '../components/ui/Section'

export function ArchitecturePage() {
  const [activeSystemId, setActiveSystemId] = useState<'course-enrollment' | 'patient-flow'>('course-enrollment')
  const system: ArchitectureSystem =
    activeSystemId === 'course-enrollment' ? courseEnrollmentSystem : hospitalPatientFlowSystem

  const [selectedLayerId, setSelectedLayerId] = useState<string>(system.layers[0].id)
  const [zoom, setZoom] = useState<number>(100)
  const [traceStep, setTraceStep] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // Switch selected layer when system changes
  useEffect(() => {
    setSelectedLayerId(system.layers[0].id)
    setTraceStep(null)
    window.clearInterval(timer.current)
  }, [activeSystemId, system.layers])

  // Clean up timer on unmount
  useEffect(() => () => window.clearInterval(timer.current), [])

  // Trace path: down then up
  const layers = system.layers
  const tracePath = [...layers.keys(), ...[...layers.keys()].slice(0, -1).reverse()]

  const runTrace = () => {
    window.clearInterval(timer.current)
    let step = 0
    setTraceStep(0)
    setSelectedLayerId(layers[tracePath[0]].id)

    timer.current = window.setInterval(() => {
      step += 1
      if (step >= tracePath.length) {
        window.clearInterval(timer.current)
        setTraceStep(null)
        return
      }
      setTraceStep(step)
      setSelectedLayerId(layers[tracePath[step]].id)
    }, 850)
  }

  const resetControls = () => {
    window.clearInterval(timer.current)
    setTraceStep(null)
    setZoom(100)
    setSelectedLayerId(system.layers[0].id)
  }

  const selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? layers[0]
  const activeTraceIdx = traceStep !== null ? tracePath[traceStep] : -1
  const isGoingDown = traceStep !== null && traceStep < layers.length

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="surface pt-20 pb-24">
      {/* Page Header */}
      <div className="bg-ink text-white py-12 px-5 sm:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1440px]">
          <Breadcrumbs items={[{ label: 'Architecture Explorer' }]} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              System Design & Topology
            </span>
            <span className="font-mono text-xs text-white/60">Verified Implementation Reference</span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            Interactive Architecture Explorer
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            Examine how requests traverse multi-tier architectures: from React and API gateways down to Spring Security,
            business services, and MySQL persistence, or inspect the AI patient-flow time-series machine learning pipeline.
          </p>

          {/* System Switcher Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-white/15 pb-4">
            <button
              type="button"
              onClick={() => setActiveSystemId('course-enrollment')}
              className={`flex items-center gap-2.5 px-4 py-2.5 font-display text-sm font-bold transition-all rounded-sm ${
                activeSystemId === 'course-enrollment'
                  ? 'bg-amber text-ink'
                  : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers size={16} /> Course Enrollment System (Spring Boot + React)
            </button>
            <button
              type="button"
              onClick={() => setActiveSystemId('patient-flow')}
              className={`flex items-center gap-2.5 px-4 py-2.5 font-display text-sm font-bold transition-all rounded-sm ${
                activeSystemId === 'patient-flow'
                  ? 'bg-amber text-ink'
                  : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Code size={16} /> Hospital Patient Flow System (Python + LSTM + REST + MySQL)
            </button>
          </div>
        </div>
      </div>

      {/* Main Architecture Workspace */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 mt-10">
        {/* System Summary Banner */}
        <div className="card p-6 mb-8 border-l-4 border-amber">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">{system.badge}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">{system.title}</h2>
              <p className="font-mono text-xs muted mt-0.5">{system.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge kind="example" />
            </div>
          </div>
          <p className="mt-3 text-sm sm:text-base leading-relaxed muted">{system.summary}</p>
        </div>

        {/* Toolbar: Trace + Zoom + Reset Controls */}
        <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 p-4 hairline">
          {/* Request Flow Trace Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runTrace}
              disabled={traceStep !== null}
              className="inline-flex items-center gap-2 bg-amber px-4 py-2 text-sm font-semibold text-ink transition-all enabled:hover:bg-amber/90 disabled:opacity-50 rounded-sm"
              aria-label="Trace request flow through layers"
            >
              <Play size={15} />
              {traceStep !== null ? 'Tracing Request Flow…' : 'Trace Request & Data Flow'}
            </button>

            {traceStep !== null && (
              <span className="flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-1 bg-ink text-amber rounded-sm animate-pulse">
                {isGoingDown ? (
                  <>
                    <ArrowDown size={14} /> Request Phase (Descending to DB)
                  </>
                ) : (
                  <>
                    <ArrowUp size={14} /> Response Phase (Ascending to Client)
                  </>
                )}
              </span>
            )}
          </div>

          {/* Zoom / Pan Controls */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs muted mr-1 hidden sm:inline">Diagram Zoom:</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(70, z - 10))}
              className="grid h-8 w-8 place-items-center border hairline hover:border-amber transition-colors rounded-sm"
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut size={15} />
            </button>
            <span className="font-mono text-xs px-2 min-w-[3.5rem] text-center font-bold">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(130, z + 10))}
              className="grid h-8 w-8 place-items-center border hairline hover:border-amber transition-colors rounded-sm"
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={resetControls}
              className="inline-flex items-center gap-1.5 border hairline px-2.5 py-1.5 text-xs font-medium hover:border-amber transition-colors rounded-sm ml-1"
              aria-label="Reset zoom and selection"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* 2-Column Explorer: Interactive Diagram + Layer Details */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,480px)_1fr] items-start">
          {/* Left Column: Interactive Layer Diagram */}
          <div className="overflow-x-auto p-1">
            <div
              className="transition-transform duration-200 origin-top-left"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <ol className="space-y-0" aria-label="Architecture layer hierarchy">
                {layers.map((l, idx) => {
                  const isSelected = l.id === selectedLayerId
                  const isTraceActive = idx === activeTraceIdx

                  return (
                    <li key={l.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedLayerId(l.id)}
                        aria-pressed={isSelected}
                        className={`group w-full border-2 p-5 text-left transition-all rounded-sm relative ${
                          isTraceActive
                            ? 'border-amber bg-amber text-ink shadow-lg ring-4 ring-amber/30'
                            : isSelected
                              ? 'border-ink bg-ink text-white shadow-md'
                              : 'hairline card hover:border-amber'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider opacity-70">
                            Layer 0{idx + 1}
                          </span>
                          <span
                            className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-sm font-semibold ${
                              isTraceActive
                                ? 'bg-ink text-white'
                                : isSelected
                                  ? 'bg-amber text-ink'
                                  : 'bg-white/10 text-foreground'
                            }`}
                          >
                            {l.type}
                          </span>
                        </div>

                        <span className="mt-1 block font-display text-xl font-bold leading-tight">
                          {l.name}
                        </span>
                        <span
                          className={`mt-1 block font-mono text-xs ${
                            isSelected && !isTraceActive ? 'text-amber' : 'opacity-80'
                          }`}
                        >
                          {l.tech}
                        </span>

                        <p
                          className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                            isSelected && !isTraceActive ? 'text-white/80' : 'muted'
                          }`}
                        >
                          {l.role}
                        </p>
                      </button>

                      {/* Directional Connector Arrow */}
                      {idx < layers.length - 1 && (
                        <div className="flex flex-col items-center py-1.5" aria-hidden>
                          <div
                            className={`flex items-center gap-1 font-mono text-[10px] font-bold ${
                              traceStep !== null
                                ? isGoingDown && idx === activeTraceIdx
                                  ? 'text-amber'
                                  : !isGoingDown && idx + 1 === activeTraceIdx
                                    ? 'text-amber'
                                    : 'opacity-30'
                                : 'opacity-40'
                            }`}
                          >
                            <span className="h-3 w-[2px] bg-current" />
                            {isGoingDown ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                            <span className="h-3 w-[2px] bg-current" />
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>

          {/* Right Column: Layer Inspector & Code Preview */}
          <div className="card p-6 sm:p-8 hairline sticky top-24" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b hairline pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
                  Layer Specification
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold mt-1">{selectedLayer.name}</h3>
                <p className="font-mono text-xs muted mt-1">{selectedLayer.tech}</p>
              </div>
              <Tag tone="amber">{selectedLayer.type.toUpperCase()}</Tag>
            </div>

            <div className="mt-5">
              <h4 className="font-mono text-xs uppercase tracking-widest font-semibold muted">
                Architectural Role & Boundary
              </h4>
              <p className="mt-2 text-base leading-relaxed">{selectedLayer.role}</p>
            </div>

            <div className="mt-6">
              <h4 className="font-mono text-xs uppercase tracking-widest font-semibold muted mb-3">
                Core Responsibilities
              </h4>
              <ul className="space-y-2.5">
                {selectedLayer.responsibilities.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-sm leading-relaxed">
                    <span className="mt-1.5 h-2 w-2 shrink-0 bg-amber" aria-hidden />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Illustrative Code Block with Copy Action */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs uppercase tracking-widest muted">
                  Illustrative {selectedLayer.lang.toUpperCase()} Implementation
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(selectedLayer.snippet)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber hover:underline"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy Snippet'}
                </button>
              </div>
              <CodeBlock code={selectedLayer.snippet} lang={selectedLayer.lang} />
            </div>
          </div>
        </div>

        {/* Section: Cross-Cutting Architectural Concerns */}
        <div className="mt-20 border-t hairline pt-16">
          <div className="max-w-3xl mb-10">
            <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber">
              Architectural Invariants
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight mt-1">
              Cross-Cutting Concerns & Verification
            </h2>
            <p className="muted mt-3 text-base leading-relaxed">
              Essential guarantees enforced consistently across all layers: how authentication, authorization,
              data validation, transactional persistence, and global exception handling are architected.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {system.crossCutting.map((cc) => (
              <div key={cc.id} className="card p-6 hairline flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={18} className="text-amber shrink-0" />
                    <h3 className="font-display text-lg font-bold">{cc.title}</h3>
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider text-amber font-semibold">
                    The Concept
                  </p>
                  <p className="text-sm muted mt-1 leading-relaxed">{cc.concept}</p>

                  <p className="text-xs font-mono uppercase tracking-wider text-amber font-semibold mt-4">
                    Implementation Approach
                  </p>
                  <p className="text-sm muted mt-1 leading-relaxed">{cc.implementation}</p>

                  <div className="bg-amber/10 border border-amber/30 p-3 rounded-sm mt-4">
                    <p className="text-xs font-mono text-ink dark:text-amber font-bold">Benefit:</p>
                    <p className="text-xs text-foreground/90 mt-0.5">{cc.benefit}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t hairline">
                  <p className="font-mono text-[11px] uppercase tracking-wider muted mb-1.5">Code Reference</p>
                  <div className="max-h-48 overflow-y-auto">
                    <CodeBlock code={cc.codeSnippet} lang={cc.lang} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
