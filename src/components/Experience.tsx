import { Award, Briefcase } from 'lucide-react'
import { certifications, education, experience, skills } from '../content/profile'
import { Section, Tag } from './ui/Section'

export function Experience() {
  return (
    <Section id="experience" eyebrow="Background" title="Experience & skills">
      <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
        <ol className="relative space-y-8 border-l-2 border-[color:var(--surface-fg)] pl-6">
          {experience.map((x) => (
            <li key={x.role} className="relative">
              <span className="absolute -left-[33px] top-1 grid h-4 w-4 place-items-center bg-amber" aria-hidden>
                <Briefcase size={10} className="text-ink" />
              </span>
              <p className="font-mono text-xs muted">{x.period}</p>
              <h3 className="font-display text-2xl font-bold">{x.role}</h3>
              <p className="font-medium">{x.company}</p>
              <ul className="mt-3 space-y-2">
                {x.points.map((p) => (
                  <li key={p} className="flex gap-3 leading-relaxed">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-amber" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className="relative">
            <span className="absolute -left-[33px] top-1 h-4 w-4 bg-ink" aria-hidden />
            <p className="font-mono text-xs muted">{education.period}</p>
            <h3 className="font-display text-2xl font-bold">{education.degree}</h3>
            <p className="font-medium">{education.school}</p>
            <p className="muted mt-1 text-sm">CGPA {education.cgpa}</p>
          </li>
        </ol>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 font-mono text-xs font-bold uppercase tracking-widest muted">Certifications</h3>
            <ul className="space-y-2">
              {certifications.map((c) => (
                <li key={c} className="card flex items-center gap-3 p-3">
                  <Award size={18} className="shrink-0 text-amber-600" aria-hidden />
                  {c}
                </li>
              ))}
            </ul>
          </div>
          {skills.map((g) => (
            <div key={g.group}>
              <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-widest muted">{g.group}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {g.items.map((i) => (
                  <li key={i}>
                    <Tag>{i}</Tag>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
