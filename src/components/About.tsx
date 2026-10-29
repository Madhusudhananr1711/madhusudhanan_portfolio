import { GraduationCap, MapPin } from 'lucide-react'
import { education, profile, spokenLanguages } from '../content/profile'
import { Reveal } from './ui/Reveal'

/** Figma ash block (#AEAEB2 with grain, 1433×752): about + education snapshot. */
export function About() {
  return (
    <section id="about" className="grain bg-ash text-ink">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:py-28">
        <Reveal>
          <h2 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
            Backend first.
            <br />
            Full stack when it counts.
          </h2>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed">{profile.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} /> {profile.location}
            </span>
            {spokenLanguages.map((l) => (
              <span key={l.name}>
                {l.name}: {l.level}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <div className="bg-ink p-6 text-white sm:p-8">
            <GraduationCap className="text-amber" size={28} />
            <h3 className="mt-4 font-display text-2xl font-bold leading-tight">{education.degree}</h3>
            <p className="mt-1 text-white/75">{education.school}</p>
            <p className="mt-4 font-mono text-sm text-amber">
              {education.period} · CGPA {education.cgpa}
            </p>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-white/60">Relevant coursework</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {education.coursework.map((c) => (
                <li key={c} className="border border-white/25 px-2 py-1 text-xs">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
