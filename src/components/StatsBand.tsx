import { marqueeItems, stats } from '../content/profile'

/** Figma amber band (#FFBB00, 1440×384): key numbers from the resume and a scrolling stack ticker. */
export function StatsBand() {
  const items = [...marqueeItems, ...marqueeItems]
  return (
    <section aria-label="Highlights" className="bg-amber text-ink">
      <div className="mx-auto flex min-h-[384px] max-w-[1440px] flex-col justify-between gap-10 py-10">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 px-5 sm:px-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-5xl font-bold leading-none tracking-tighter sm:text-6xl lg:text-7xl">
                  {s.value}
                </span>
                <span className="mt-2 block max-w-[16rem] text-sm font-medium leading-snug">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>

        <div className="marquee overflow-hidden border-y-2 border-ink py-3" aria-hidden>
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap font-display text-2xl font-bold uppercase">
            {items.map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                {t}
                <span className="h-2 w-2 bg-ink" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
