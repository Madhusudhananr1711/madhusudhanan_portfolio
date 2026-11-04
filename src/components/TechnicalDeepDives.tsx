import { ArrowRight, BookOpen, FileText, Layers, ShieldCheck, Terminal } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Section, Tag } from './ui/Section'

const deepDives = [
  {
    to: '/architecture',
    title: 'Architecture Explorer',
    routePath: '/architecture',
    eyebrow: 'Dedicated Page',
    badge: 'Separate Route',
    icon: Layers,
    description:
      'Interactive request & data flow across React, Spring Security, Controller, Service, JPA Repository, and MySQL. Includes the AI Patient Flow ML architecture.',
    tags: ['Spring Boot 3', 'Request Tracing', 'Layered Architecture', 'LSTM Pipeline'],
    cta: 'Open Architecture Page',
  },
  {
    to: '/api-playground',
    title: 'Interactive API Playground',
    routePath: '/api-playground',
    eyebrow: 'Dedicated Page',
    badge: 'Separate Route',
    icon: Terminal,
    description:
      'In-browser API testing workbench. Switch roles (Student, Admin, Hospital Admin), test GET, POST, DELETE endpoints, inspect status codes, and examine response payloads.',
    tags: ['JWT Bearer Auth', 'RBAC Testing', '200 / 401 / 403 / 409', 'JSON Payloads'],
    cta: 'Open API Playground Page',
  },
  {
    to: '/security',
    title: 'Security & RBAC Showcase',
    routePath: '/security',
    eyebrow: 'Dedicated Page',
    badge: 'Separate Route',
    icon: ShieldCheck,
    description:
      'Deep dive into stateless JWT authentication, Spring Security filter chains, Role-Based Access Control, controller-edge Bean Validation, and salted password hashing.',
    tags: ['JWT Tokens', '401 vs 403', 'Bean Validation', 'BCrypt / PBKDF2'],
    cta: 'Open Security Page',
  },
  {
    to: '/docs',
    title: 'OpenAPI Documentation',
    routePath: '/docs',
    eyebrow: 'Dedicated Page',
    badge: 'Separate Route',
    icon: BookOpen,
    description:
      'Comprehensive REST API reference featuring endpoint groups, parameters, request body schemas, status codes, copyable cURL commands, and full OpenAPI 3.0.3 export.',
    tags: ['Swagger / OAS 3.0', 'Request Schemas', 'cURL Snippets', 'Export Spec'],
    cta: 'Open API Docs Page',
  },
  {
    to: '/case-studies',
    title: 'Technical Case Studies',
    routePath: '/case-studies',
    eyebrow: 'Dedicated Page',
    badge: 'Separate Route',
    icon: FileText,
    description:
      'Engineering challenges, technical approaches, architectural trade-offs, and verified resume outcomes across course enrollment security, schema design, and patient forecasting.',
    tags: ['System Trade-offs', 'Normalized MySQL', 'LSTM Forecasting', 'Analytics'],
    cta: 'Open Case Studies Page',
  },
]

export function TechnicalDeepDives() {
  return (
    <Section
      id="technical-deep-dives"
      eyebrow="Technical Pages"
      title="Architecture, APIs, Security & Case Studies"
      intro="Five dedicated technical pages detailing my engineering practices: interactive layered architecture, in-browser API testing, security patterns, OpenAPI contracts, and engineering case studies."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {deepDives.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className="card group relative flex flex-col justify-between p-6 transition-all hover:-translate-y-1 hover:border-amber focus:outline-none focus:ring-2 focus:ring-amber"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center bg-amber text-ink rounded-sm">
                    <Icon size={20} aria-hidden />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-amber font-semibold bg-ink px-2 py-0.5 rounded-sm">
                    {item.badge}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-widest muted">{item.eyebrow}</p>
                  <span className="font-mono text-xs bg-amber/20 text-ink dark:text-amber px-2 py-0.5 rounded-sm font-semibold">
                    {item.routePath}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold leading-tight group-hover:text-amber transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-xs text-foreground/80 leading-relaxed muted">
                  {item.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t hairline flex items-center justify-between text-xs font-semibold text-ink dark:text-amber">
                <span>{item.cta}</span>
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1 text-amber"
                  aria-hidden
                />
              </div>
            </Link>
          )
        })}
      </div>
    </Section>
  )
}
