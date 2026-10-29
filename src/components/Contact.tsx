import { useState } from 'react'
import type { SVGProps } from 'react'
import { Download, Mail, MapPin, Phone } from 'lucide-react'
import { profile } from '../content/profile'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }
const brand = (d: string) =>
  function BrandIcon({ size = 20, ...rest }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...rest}>
        <path d={d} />
      </svg>
    )
  }
const Github = brand('M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z')
const Linkedin = brand('M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z')

export function Contact() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${name || 'your portfolio'}`)}&body=${encodeURIComponent(message)}`

  const rows = [
    { icon: Mail, label: profile.email, href: `mailto:${profile.email}` },
    { icon: Phone, label: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
    { icon: Linkedin, label: 'LinkedIn', href: profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}` },
    { icon: Github, label: 'GitHub', href: profile.github },
  ]

  return (
    <section id="contact" className="bg-amber text-ink">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:py-28">
        <div>
          <h2 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tighter sm:text-7xl">
            Let's build
            <br />
            something.
          </h2>
          <ul className="mt-8 space-y-3">
            {rows.map(({ icon: Icon, label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-3 text-lg font-semibold underline decoration-2 underline-offset-4"
                >
                  <Icon size={20} aria-hidden /> {label}
                </a>
              </li>
            ))}
            <li className="inline-flex items-center gap-3 text-lg font-semibold">
              <MapPin size={20} aria-hidden /> {profile.location}
            </li>
          </ul>
          <a
            href={profile.resumeUrl}
            download
            className="mt-8 inline-flex items-center gap-2 bg-ink px-5 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
          >
            <Download size={16} /> Download resume (PDF)
          </a>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = mailto
          }}
          className="grid content-start gap-4 bg-ink p-6 text-white sm:p-8"
        >
          <h3 className="font-display text-2xl font-bold">Send a message</h3>
          <label className="grid gap-1 text-sm font-medium">
            Your name
            <input value={name} onChange={(e) => setName(e.target.value)} className="border border-white/30 bg-transparent px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Message
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="border border-white/30 bg-transparent px-3 py-2"
            />
          </label>
          <button type="submit" className="bg-amber px-5 py-3 font-semibold text-ink transition-transform hover:-translate-y-0.5">
            Open in my email app
          </button>
          <p className="text-xs text-white/60">This opens your email client with the message pre-filled. Nothing is stored by this site.</p>
        </form>
      </div>
    </section>
  )
}
