import { ArrowDown, Download } from 'lucide-react'
import { profile } from '../content/profile'

/**
 * Figma "Desktop - 1": black (#040404) hero, 1440×982, torn-paper band with the portrait
 * centred over it. The headline sits in the empty black area above the paper.
 */
export function Hero() {
  return (
    <section id="top" className="relative bg-ink text-white">
      <div className="mx-auto max-w-[1440px]">
        {/* Copy: overlays the black area on large screens, stacks above the image on small ones */}
        <div className="relative z-10 px-5 pb-8 pt-28 sm:px-8 lg:absolute lg:inset-x-0 lg:top-0 lg:pb-0 lg:pt-[6.5%]">
          <p className="mb-4 inline-block bg-amber px-2 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-ink">
            Open to entry-level Java roles
          </p>
          <h1 className="font-display text-[clamp(2.25rem,8.6vw,8.25rem)] font-bold uppercase leading-[0.88] tracking-tighter">
            Madhusudhanan <span className="text-amber">R</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/80 sm:text-xl">
            {profile.role}. I build secure Spring Boot REST APIs, MySQL-backed systems and React front ends.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
            <HeroCtas />
          </div>
        </div>

        <div className="relative -mt-12 aspect-square w-full overflow-hidden sm:-mt-20 lg:mt-0 sm:aspect-[4/3] lg:aspect-[1440/982]">
          <img
            src="/hero.webp"
            alt="Black-and-white illustrated portrait of Madhusudhanan R with arms crossed, in front of a torn-paper band"
            width={1440}
            height={982}
            className="absolute inset-0 h-full w-full object-cover object-[50%_100%]"
            fetchPriority="high"
          />
          <div className="absolute bottom-6 left-5 z-10 hidden gap-3 lg:flex xl:left-8">
            <HeroCtas />
          </div>
          <a
            href="#work"
            aria-label="Scroll to work"
            className="pulse-ring absolute bottom-6 right-5 z-10 hidden h-11 w-11 place-items-center rounded-full bg-amber text-ink sm:grid xl:right-8"
          >
            <ArrowDown size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}

function HeroCtas() {
  return (
    <>
      <a href="#work" className="bg-amber px-5 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5">
        View my work
      </a>
      <a
        href={profile.resumeUrl}
        download
        className="inline-flex items-center gap-2 border border-white/60 bg-ink/60 px-5 py-3 font-semibold text-white backdrop-blur transition-colors hover:border-amber hover:text-amber"
      >
        <Download size={16} /> Resume
      </a>
    </>
  )
}
