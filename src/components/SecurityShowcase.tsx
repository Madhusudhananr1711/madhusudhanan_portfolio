import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { endpoints } from '../content/api'
import { signDemoToken } from '../lib/mockApi'
import { Badge, CodeBlock, Section } from './ui/Section'

type TabId = 'jwt' | 'rbac' | 'validation' | 'exceptions' | 'hashing'
const tabs: { id: TabId; label: string }[] = [
  { id: 'jwt', label: 'JWT authentication' },
  { id: 'rbac', label: 'RBAC' },
  { id: 'validation', label: 'Request validation' },
  { id: 'exceptions', label: 'Exception handling' },
  { id: 'hashing', label: 'Password hashing' },
]

export function SecurityShowcase() {
  const [tab, setTab] = useState<TabId>('jwt')
  return (
    <Section
      id="security"
      eyebrow="Security"
      title="Security showcase"
      intro="The concepts behind how I secure Spring Boot APIs, each with something you can interact with. Java snippets are illustrative examples of the pattern."
    >
      <div role="tablist" aria-label="Security topics" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`sec-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`sec-panel-${t.id}`}
            onClick={() => setTab(t.id)}
            className={`border px-4 py-2 text-sm font-semibold transition-colors ${
              tab === t.id ? 'border-ink bg-ink text-white' : 'hairline hover:border-amber'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`sec-panel-${tab}`} aria-labelledby={`sec-tab-${tab}`} className="card mt-4 p-6 sm:p-8">
        {tab === 'jwt' && <Jwt />}
        {tab === 'rbac' && <Rbac />}
        {tab === 'validation' && <Validation />}
        {tab === 'exceptions' && <Exceptions />}
        {tab === 'hashing' && <Hashing />}
      </div>
    </Section>
  )
}

function Heading({ title, children }: { title: string; children: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <h3 className="font-display text-2xl font-bold sm:text-3xl">{title}</h3>
      <p className="muted mt-2 leading-relaxed">{children}</p>
    </div>
  )
}

function Jwt() {
  const token = useMemo(() => signDemoToken('student@example.com', 'STUDENT'), [])
  const [h, p, s] = token.split('.')
  const decode = (x: string) => {
    try {
      const pad = x.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.stringify(JSON.parse(atob(pad + '='.repeat((4 - (pad.length % 4)) % 4))), null, 2)
    } catch {
      return ''
    }
  }
  return (
    <>
      <Heading title="JWT authentication">
        After login the server issues a signed token. Every later request carries it, and a filter verifies the signature and expiry before any controller runs, so the API stays stateless.
      </Heading>
      <div className="mb-3 flex items-center gap-2">
        <Badge kind="example" />
        <span className="muted text-sm">Unsigned demonstration token, not a real credential.</span>
      </div>
      <p className="break-all font-mono text-[13px] leading-relaxed" aria-label="Example JWT">
        <span className="text-rose-500">{h}</span>.<span className="text-violet-500">{p}</span>.<span className="text-sky-500">{s}</span>
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Header', note: 'Algorithm and token type', data: decode(h), color: 'text-rose-500' },
          { label: 'Payload', note: 'Claims: subject, role, issued/expiry times', data: decode(p), color: 'text-violet-500' },
          { label: 'Signature', note: 'HMAC over header + payload with a server secret; proves the token was not altered', data: s, color: 'text-sky-500' },
        ].map((x) => (
          <div key={x.label}>
            <p className={`font-mono text-xs font-bold uppercase tracking-widest ${x.color}`}>{x.label}</p>
            <p className="muted mb-2 text-xs">{x.note}</p>
            <CodeBlock code={x.data} />
          </div>
        ))}
      </div>
      <p className="mb-2 mt-6 font-mono text-xs uppercase tracking-widest muted">Illustrative Java</p>
      <CodeBlock
        lang="java"
        code={`public String issue(UserDetails user) {
  return Jwts.builder()
      .subject(user.getUsername())
      .claim("role", user.getAuthorities().iterator().next().getAuthority())
      .issuedAt(new Date())
      .expiration(new Date(System.currentTimeMillis() + 3_600_000))
      .signWith(signingKey)
      .compact();
}`}
      />
    </>
  )
}

function Rbac() {
  const [role, setRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT')
  const allowed = (access: string) => access === 'public' || access === 'authenticated' || access === role
  return (
    <>
      <Heading title="Role-Based Access Control">
        Permissions are attached to roles, and endpoints declare which roles may call them. Switch role to see which example endpoints are allowed or answered with 403 Forbidden.
      </Heading>
      <div role="group" aria-label="Role" className="mb-5 inline-flex overflow-hidden rounded-sm border hairline">
        {(['STUDENT', 'ADMIN'] as const).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={`px-4 py-2 font-mono text-sm font-bold ${role === r ? 'bg-amber text-ink' : ''}`}
          >
            {r}
          </button>
        ))}
      </div>
      <ul className="grid gap-2">
        {endpoints.map((e) => {
          const ok = allowed(e.access)
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-3 border hairline p-3">
              <span className="w-16 font-mono text-xs font-bold">{e.method}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-sm">{e.path}</span>
              <span className="muted font-mono text-xs">requires {e.access}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-mono text-xs font-bold ${
                  ok ? 'bg-emerald-500 text-ink' : 'bg-rose-500 text-white'
                }`}
              >
                {ok ? <Check size={13} aria-hidden /> : <X size={13} aria-hidden />}
                {ok ? 'Allowed' : '403 Forbidden'}
              </span>
            </li>
          )
        })}
      </ul>
      <p className="mb-2 mt-6 font-mono text-xs uppercase tracking-widest muted">Illustrative Java</p>
      <CodeBlock
        lang="java"
        code={`@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/courses/{id}")
public ResponseEntity<Void> delete(@PathVariable Long id) { ... }`}
      />
    </>
  )
}

function Validation() {
  const [title, setTitle] = useState('')
  const [capacity, setCapacity] = useState('0')
  const errors: Record<string, string> = {}
  const t = title.trim()
  if (t.length < 3 || t.length > 80) errors.title = 'size must be between 3 and 80'
  const n = Number(capacity)
  if (!Number.isInteger(n) || n < 1 || n > 500) errors.capacity = 'must be a whole number between 1 and 500'
  const ok = Object.keys(errors).length === 0
  return (
    <>
      <Heading title="Request validation">
        Input is checked at the controller edge with Bean Validation, so malformed requests are rejected with 400 before touching business logic or the database.
      </Heading>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <label className="grid gap-1 text-sm font-medium">
            title
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="border hairline bg-transparent px-3 py-2 font-mono" placeholder="e.g. Spring Security Basics" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            capacity
            <input value={capacity} onChange={(e) => setCapacity(e.target.value)} inputMode="numeric" className="border hairline bg-transparent px-3 py-2 font-mono" />
          </label>
          <CodeBlock
            lang="java"
            code={`public record CreateCourseRequest(
  @NotBlank @Size(min = 3, max = 80) String title,
  @Min(1) @Max(500) int capacity
) {}`}
          />
        </div>
        <div aria-live="polite">
          <p className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest muted">
            Server would respond <Badge kind="simulated" />
          </p>
          <CodeBlock
            code={
              ok
                ? `201 Created\n${JSON.stringify({ title: t, capacity: n }, null, 2)}`
                : `400 Bad Request\n${JSON.stringify({ message: 'Validation failed', fieldErrors: errors }, null, 2)}`
            }
          />
        </div>
      </div>
    </>
  )
}

const exceptionRows = [
  { ex: 'MethodArgumentNotValidException', status: 400, why: 'Request body failed validation' },
  { ex: 'AuthenticationException / invalid JWT', status: 401, why: 'Missing, expired or tampered token' },
  { ex: 'AccessDeniedException', status: 403, why: 'Authenticated but role not allowed' },
  { ex: 'NotFoundException', status: 404, why: 'Requested resource does not exist' },
  { ex: 'ConflictException', status: 409, why: 'Business rule violated, e.g. duplicate enrollment' },
  { ex: 'Exception (fallback)', status: 500, why: 'Unexpected error; details logged, generic message returned' },
]

function Exceptions() {
  const [i, setI] = useState(0)
  const row = exceptionRows[i]
  return (
    <>
      <Heading title="Centralized exception handling">
        One @RestControllerAdvice maps exceptions to HTTP status codes and a consistent JSON body, so clients always receive predictable errors and internals are never leaked.
      </Heading>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ul className="grid gap-2">
          {exceptionRows.map((r, idx) => (
            <li key={r.ex}>
              <button
                type="button"
                aria-pressed={idx === i}
                onClick={() => setI(idx)}
                className={`flex w-full items-center gap-3 border p-3 text-left ${idx === i ? 'border-ink bg-ink text-white' : 'hairline hover:border-amber'}`}
              >
                <span className="w-10 font-mono font-bold text-amber">{r.status}</span>
                <span className="font-mono text-xs">{r.ex}</span>
              </button>
            </li>
          ))}
        </ul>
        <div aria-live="polite">
          <p className="muted mb-2 text-sm">{row.why}</p>
          <CodeBlock
            code={JSON.stringify(
              { status: row.status, error: row.ex.split(' ')[0], message: row.why, timestamp: '2026-01-01T10:00:00Z' },
              null,
              2,
            )}
          />
          <p className="mb-2 mt-4 font-mono text-xs uppercase tracking-widest muted">Illustrative Java</p>
          <CodeBlock
            lang="java"
            code={`@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(NotFoundException.class)
  ResponseEntity<ApiError> notFound(NotFoundException ex) {
    return ResponseEntity.status(404).body(ApiError.of(404, ex.getMessage()));
  }
}`}
          />
        </div>
      </div>
    </>
  )
}

const toHex = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

function Hashing() {
  const [pw, setPw] = useState('Password@123')
  const [out, setOut] = useState<{ salt: string; hash: string } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setError('')
    if (!globalThis.crypto?.subtle) {
      setError('Web Crypto is unavailable in this context (it needs HTTPS or localhost).')
      return
    }
    setBusy(true)
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits'])
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' }, key, 256)
      setOut({ salt: toHex(salt.buffer), hash: toHex(bits) })
    } catch {
      setError('Hashing failed in this browser.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Heading title="Password hashing">
        Passwords are never stored in plain text. They are run through a slow, salted one-way function, so identical passwords produce different hashes and stolen hashes are expensive to crack. Click twice and compare.
      </Heading>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          <label className="grid gap-1 text-sm font-medium">
            Password to hash
            <input value={pw} onChange={(e) => setPw(e.target.value)} className="border hairline bg-transparent px-3 py-2 font-mono" />
          </label>
          <button
            type="button"
            onClick={run}
            disabled={busy || !pw}
            className="w-fit bg-ink px-5 py-2 font-semibold text-white transition-colors enabled:hover:bg-amber enabled:hover:text-ink disabled:opacity-50"
          >
            {busy ? 'Hashing…' : 'Hash it'}
          </button>
          <p className="muted text-xs">
            Live demo uses PBKDF2-SHA256 from your browser's Web Crypto. Spring Security applications typically use BCryptPasswordEncoder, which follows the same salted, slow-hash principle.
          </p>
          {error && <p role="alert" className="text-sm font-medium text-rose-500">{error}</p>}
          <CodeBlock
            lang="java"
            code={`@Bean
PasswordEncoder passwordEncoder() {
  return new BCryptPasswordEncoder();
}
// on register: user.setPassword(encoder.encode(rawPassword));`}
          />
        </div>
        <div aria-live="polite">
          {out ? (
            <CodeBlock code={`salt (random, 16 bytes)\n${out.salt}\n\nhash (PBKDF2-SHA256, 120,000 iterations)\n${out.hash}`} />
          ) : (
            <div className="muted grid min-h-[10rem] place-items-center border border-dashed hairline p-4 text-center text-sm">
              Hash a password to see the salt and result.
            </div>
          )}
        </div>
      </div>
    </>
  )
}
