import { useMemo, useState } from 'react'
import {
  Check,
  CheckCircle,
  Hash,
  Key,
  Lock,
  RefreshCw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { endpoints } from '../content/api'
import { signDemoToken } from '../lib/mockApi'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { CodeBlock } from '../components/ui/Section'

type SecurityTab =
  | 'jwt-flow'
  | 'authn-vs-authz'
  | 'rbac'
  | 'filter-chain'
  | 'validation'
  | 'exceptions'
  | 'hashing'

interface TabOption {
  id: SecurityTab
  label: string
  icon: typeof Shield
}

const tabs: TabOption[] = [
  { id: 'jwt-flow', label: 'JWT Auth Flow', icon: Key },
  { id: 'authn-vs-authz', label: 'AuthN vs AuthZ', icon: ShieldCheck },
  { id: 'rbac', label: 'RBAC Simulator', icon: Users },
  { id: 'filter-chain', label: 'Spring Filter Chain', icon: Server },
  { id: 'validation', label: 'Input Validation', icon: CheckCircle },
  { id: 'exceptions', label: 'Exception Handling', icon: ShieldAlert },
  { id: 'hashing', label: 'Password Hashing', icon: Hash },
]

export function SecurityPage() {
  const [activeTab, setActiveTab] = useState<SecurityTab>('jwt-flow')

  return (
    <div className="surface pt-20 pb-24">
      {/* Header Banner */}
      <div className="bg-ink text-white py-12 px-5 sm:px-8 border-b border-white/10">
        <div className="mx-auto max-w-[1440px]">
          <Breadcrumbs items={[{ label: 'Security Showcase' }]} />
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-amber px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink">
              Enterprise Application Security
            </span>
            <span className="font-mono text-xs text-white/60">Spring Security 6 · JWT · RBAC</span>
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight">
            Security Architecture & Patterns
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-white/80 leading-relaxed">
            A comprehensive look at how I secure Spring Boot REST APIs: stateless JWT authentication,
            fine-grained Role-Based Access Control (RBAC), perimeter request validation, and centralized exception defense.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-white/15 pb-4">
            {tabs.map((t) => {
              const Icon = t.icon
              const isSelected = activeTab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 font-display text-xs sm:text-sm font-bold transition-all rounded-sm ${
                    isSelected
                      ? 'bg-amber text-ink'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon size={15} />
                  <span>{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 mt-10">
        <div className="card p-6 sm:p-10 hairline">
          {activeTab === 'jwt-flow' && <JwtFlowSection />}
          {activeTab === 'authn-vs-authz' && <AuthnVsAuthzSection />}
          {activeTab === 'rbac' && <RbacSimulatorSection />}
          {activeTab === 'filter-chain' && <FilterChainSection />}
          {activeTab === 'validation' && <ValidationSection />}
          {activeTab === 'exceptions' && <ExceptionsSection />}
          {activeTab === 'hashing' && <HashingSection />}
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 max-w-3xl border-b hairline pb-5">
      <h2 className="font-display text-2xl sm:text-3xl font-bold">{title}</h2>
      <p className="muted mt-2 text-sm sm:text-base leading-relaxed">{subtitle}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 1. JWT Flow & Decoder                                                      */
/* -------------------------------------------------------------------------- */
function JwtFlowSection() {
  const [role, setRole] = useState<'STUDENT' | 'ADMIN' | 'HOSPITAL_ADMIN'>('STUDENT')
  const [email, setEmail] = useState('student@example.com')

  const token = useMemo(() => signDemoToken(email, role), [email, role])
  const [h, p, s] = token.split('.')

  const decodeJwtPart = (part: string) => {
    try {
      const pad = part.replace(/-/g, '+').replace(/_/g, '/')
      return JSON.stringify(JSON.parse(atob(pad + '='.repeat((4 - (pad.length % 4)) % 4))), null, 2)
    } catch {
      return 'Malformed token part'
    }
  }

  const steps = [
    { num: '01', title: 'Client Login', desc: 'Sends POST /api/auth/login with credentials in request body.' },
    { num: '02', title: 'Verify & Sign', desc: 'Server validates password hash; generates signed HMAC-SHA256 JWT.' },
    { num: '03', title: 'Bearer Storage', desc: 'Client stores token in memory and attaches Authorization: Bearer on API calls.' },
    { num: '04', title: 'OncePerRequestFilter', desc: 'Extracts token, checks signature & expiration before controllers execute.' },
    { num: '05', title: 'SecurityContext', desc: 'Principal & authorities set in ThreadLocal SecurityContextHolder.' },
  ]

  return (
    <div>
      <SectionHeading
        title="Stateless JWT Authentication Flow"
        subtitle="How tokens are issued after credential verification, transmitted securely in HTTP headers, and validated statelessly on every subsequent request."
      />

      {/* Step by Step Diagram */}
      <div className="mb-10">
        <h3 className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-4">
          Request Execution Lifecycle
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((st) => (
            <div key={st.num} className="card p-4 hairline border-t-2 border-amber">
              <span className="font-mono text-xs font-bold text-amber">{st.num}</span>
              <h4 className="font-display text-base font-bold mt-1">{st.title}</h4>
              <p className="text-xs muted mt-1.5 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Token Generator & Inspector */}
      <div className="card p-6 hairline bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b hairline pb-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-amber font-semibold">
              Live Token Inspector
            </span>
            <p className="text-sm muted mt-0.5">
              Change the role to observe the updated token payload claims.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['STUDENT', 'ADMIN', 'HOSPITAL_ADMIN'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r)
                  setEmail(r === 'STUDENT' ? 'student@example.com' : r === 'ADMIN' ? 'admin@example.com' : 'hospital_admin@example.com')
                }}
                className={`px-3 py-1 font-mono text-xs font-bold rounded-sm border ${
                  role === r ? 'bg-amber text-ink border-amber' : 'hairline hover:border-amber'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Encoded JWT Output */}
        <div className="mt-4">
          <p className="font-mono text-xs uppercase tracking-widest muted mb-2">Compact Encoded Token</p>
          <p className="break-all font-mono text-xs p-3 bg-ink text-white rounded-sm leading-relaxed border hairline">
            <span className="text-rose-400" title="Header (Algorithm & Type)">{h}</span>
            <span className="text-white/40">.</span>
            <span className="text-violet-400" title="Payload (Claims & Expiry)">{p}</span>
            <span className="text-white/40">.</span>
            <span className="text-sky-400" title="Signature (HMAC-SHA256)">{s}</span>
          </p>
        </div>

        {/* Decoded Anatomy */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="card p-4 hairline">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-rose-500">
              1. Header (JOSE)
            </p>
            <p className="text-xs muted mt-1 mb-2">Specifies cryptographic algorithm (HS256) and token type.</p>
            <CodeBlock code={decodeJwtPart(h)} lang="json" />
          </div>

          <div className="card p-4 hairline">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-violet-500">
              2. Payload (Claims)
            </p>
            <p className="text-xs muted mt-1 mb-2">Principal identity (sub), authorities (role), and expiration timestamps.</p>
            <CodeBlock code={decodeJwtPart(p)} lang="json" />
          </div>

          <div className="card p-4 hairline">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-sky-500">
              3. Signature
            </p>
            <p className="text-xs muted mt-1 mb-2">HMAC-SHA256 hash verifying the token was not tampered with in transit.</p>
            <CodeBlock code={`// Server verifies:\nHMACSHA256(\n  base64Url(header) + "." +\n  base64Url(payload),\n  secretKey\n) === signature`} lang="java" />
          </div>
        </div>
      </div>

      {/* Illustrative Java Filter Implementation */}
      <div className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest muted mb-2">
          Spring Security Token Filter Implementation
        </p>
        <CodeBlock
          lang="java"
          code={`@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
    final String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    final String token = authHeader.substring(7);
    if (jwtService.isTokenValid(token)) {
      String username = jwtService.extractUsername(token);
      UserDetails userDetails = userDetailsService.loadUserByUsername(username);

      var authToken = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities());
      authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
      SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    filterChain.doFilter(request, response);
  }
}`}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 2. Authentication vs Authorization                                         */
/* -------------------------------------------------------------------------- */
function AuthnVsAuthzSection() {
  return (
    <div>
      <SectionHeading
        title="Authentication (401) vs Authorization (403)"
        subtitle="A critical architectural distinction: verifying identity versus enforcing permissions."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Authentication Card */}
        <div className="card p-6 hairline border-t-4 border-amber">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck size={22} className="text-amber" />
              <h3 className="font-display text-2xl font-bold">Authentication (AuthN)</h3>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber text-ink rounded-sm">
              HTTP 401 Unauthorized
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground/90">
            Core Question: <span className="text-amber">"Who are you?"</span>
          </p>
          <p className="muted mt-2 text-sm leading-relaxed">
            The process of verifying that an entity or user is truly who they claim to be. In this architecture,
            it happens when credentials are exchanged for a signed token, or when incoming requests are checked for a valid Bearer JWT.
          </p>

          <div className="mt-5 space-y-2 text-xs">
            <p className="font-mono font-bold text-amber uppercase">Common Failure Triggers:</p>
            <ul className="space-y-1.5 list-disc list-inside muted">
              <li>No <code className="text-foreground">Authorization</code> header provided on a protected endpoint.</li>
              <li>Token signature does not match server signing key (tampered).</li>
              <li>Token has passed its <code className="text-foreground">exp</code> timestamp (expired session).</li>
              <li>Incorrect email or password entered at login endpoint.</li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-wider muted mb-1">Standard 401 Response</p>
            <CodeBlock
              lang="json"
              code={`{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/courses/1",
  "timestamp": "2026-11-04T18:00:00Z"
}`}
            />
          </div>
        </div>

        {/* Authorization Card */}
        <div className="card p-6 hairline border-t-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock size={22} className="text-rose-500" />
              <h3 className="font-display text-2xl font-bold">Authorization (AuthZ)</h3>
            </div>
            <span className="font-mono text-xs font-bold px-2 py-0.5 bg-rose-500 text-white rounded-sm">
              HTTP 403 Forbidden
            </span>
          </div>

          <p className="mt-4 text-sm font-semibold text-foreground/90">
            Core Question: <span className="text-rose-500">"What are you allowed to do?"</span>
          </p>
          <p className="muted mt-2 text-sm leading-relaxed">
            The process of determining whether an authenticated identity has permission to perform a specific action
            on a resource. The user is known, but lacks the necessary role or authority.
          </p>

          <div className="mt-5 space-y-2 text-xs">
            <p className="font-mono font-bold text-rose-500 uppercase">Common Failure Triggers:</p>
            <ul className="space-y-1.5 list-disc list-inside muted">
              <li>Student attempting to create or delete a course (<code className="text-foreground">ROLE_ADMIN</code> needed).</li>
              <li>Admin attempting to enroll as a student (<code className="text-foreground">ROLE_STUDENT</code> needed).</li>
              <li>Course administrator trying to view hospital telemetry (<code className="text-foreground">ROLE_HOSPITAL_ADMIN</code> needed).</li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="font-mono text-xs uppercase tracking-wider muted mb-1">Standard 403 Response</p>
            <CodeBlock
              lang="json"
              code={`{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied: requires authority ROLE_ADMIN",
  "path": "/api/courses",
  "timestamp": "2026-11-04T18:00:00Z"
}`}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 3. Role-Based Access Control (RBAC) Simulator                              */
/* -------------------------------------------------------------------------- */
function RbacSimulatorSection() {
  type RoleType = 'ANONYMOUS' | 'STUDENT' | 'ADMIN' | 'HOSPITAL_ADMIN'
  const [selectedRole, setSelectedRole] = useState<RoleType>('STUDENT')

  const isPermitted = (access: string) => {
    if (access === 'public') return true
    if (selectedRole === 'ANONYMOUS') return false
    if (access === 'authenticated') return true
    if (access === selectedRole) return true
    if (selectedRole === 'ADMIN') return true // ADMIN has super-user course rights
    return false
  }

  return (
    <div>
      <SectionHeading
        title="Role-Based Access Control (RBAC) Simulator"
        subtitle="Test how access decisions are evaluated across roles. Select a role to simulate permissions across all system endpoints in real time."
      />

      {/* Role Selector Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs uppercase tracking-widest muted mr-2">Simulate Role:</span>
        {(['ANONYMOUS', 'STUDENT', 'ADMIN', 'HOSPITAL_ADMIN'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setSelectedRole(r)}
            className={`px-4 py-2 font-mono text-xs font-bold rounded-sm border transition-all ${
              selectedRole === r
                ? 'bg-amber text-ink border-amber shadow-sm'
                : 'hairline card hover:border-amber'
            }`}
          >
            {r === 'ANONYMOUS' ? 'Anonymous (Logged Out)' : r}
          </button>
        ))}
      </div>

      {/* Permissions Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b hairline bg-white/5 font-mono text-xs uppercase tracking-wider">
              <th className="p-3">HTTP Method</th>
              <th className="p-3">Endpoint Path</th>
              <th className="p-3">Required Authority</th>
              <th className="p-3 text-right">Access Decision</th>
            </tr>
          </thead>
          <tbody className="divide-y hairline">
            {endpoints.map((e) => {
              const allowed = isPermitted(e.access)
              const reason =
                selectedRole === 'ANONYMOUS' && e.access !== 'public'
                  ? '401 Unauthorized'
                  : allowed
                    ? '200 OK / 201 Created'
                    : '403 Forbidden'

              return (
                <tr key={e.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-mono font-bold text-xs">{e.method}</td>
                  <td className="p-3 font-mono text-xs">{e.path}</td>
                  <td className="p-3 font-mono text-xs text-amber">{e.access}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm font-mono text-xs font-bold ${
                        allowed
                          ? 'bg-emerald-500 text-ink'
                          : reason.startsWith('401')
                            ? 'bg-amber text-ink'
                            : 'bg-rose-500 text-white'
                      }`}
                    >
                      {allowed ? <Check size={13} /> : <X size={13} />}
                      {reason}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Illustrative Java Controller Security */}
      <div className="mt-8">
        <p className="font-mono text-xs uppercase tracking-widest muted mb-2">
          Method Security Annotations (@PreAuthorize)
        </p>
        <CodeBlock
          lang="java"
          code={`@Configuration
@EnableMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig {}

// Controller Handler Guard
@DeleteMapping("/api/courses/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
  courseService.deleteCourse(id);
  return ResponseEntity.noContent().build();
}`}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 4. Spring Security Filter Chain Architecture                               */
/* -------------------------------------------------------------------------- */
function FilterChainSection() {
  const chainSteps = [
    { name: 'CorsFilter', role: 'Handles Cross-Origin Resource Sharing headers & preflight OPTIONS requests.' },
    { name: 'CsrfFilter (Disabled)', role: 'Disabled for stateless Bearer JWT APIs, eliminating CSRF tokens for API clients.' },
    { name: 'JwtAuthenticationFilter', role: 'Custom OncePerRequestFilter checking Authorization: Bearer, validating HMAC signature.' },
    { name: 'SecurityContextHolder', role: 'Stores the authenticated principal in thread-local storage for downstream services.' },
    { name: 'ExceptionTranslationFilter', role: 'Catches AccessDeniedException and AuthenticationException, converting to 401/403.' },
    { name: 'AuthorizationFilter', role: 'Enforces URL patterns (.requestMatchers("/api/auth/**").permitAll()) before controller dispatch.' },
  ]

  return (
    <div>
      <SectionHeading
        title="Spring Security 6 Architecture & Filter Chain"
        subtitle="How the SecurityFilterChain intercepts requests sequentially before reaching MVC controllers."
      />

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        <div className="space-y-3">
          <p className="font-mono text-xs uppercase tracking-widest text-amber font-semibold mb-3">
            Execution Order in SecurityFilterChain
          </p>
          {chainSteps.map((s, idx) => (
            <div key={s.name} className="card p-4 hairline flex items-start gap-4">
              <span className="font-mono text-xs font-bold text-amber px-2 py-1 bg-ink rounded-sm">
                0{idx + 1}
              </span>
              <div>
                <h4 className="font-display font-bold text-base">{s.name}</h4>
                <p className="text-xs muted mt-1 leading-relaxed">{s.role}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="font-mono text-xs uppercase tracking-widest muted mb-2">
            Spring Security Java Configuration
          </p>
          <CodeBlock
            lang="java"
            code={`@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

  private final JwtAuthenticationFilter jwtAuthFilter;
  private final AuthenticationProvider authenticationProvider;

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable)
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/courses/**").authenticated()
            .requestMatchers("/api/courses/**").hasRole("ADMIN")
            .requestMatchers("/api/enrollments/**").hasRole("STUDENT")
            .requestMatchers("/api/hospital/**").hasRole("HOSPITAL_ADMIN")
            .anyRequest().authenticated()
        )
        .authenticationProvider(authenticationProvider)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }
}`}
          />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 5. Request Validation                                                      */
/* -------------------------------------------------------------------------- */
function ValidationSection() {
  const [title, setTitle] = useState('Core Java Advanced')
  const [capacity, setCapacity] = useState('35')

  const errors: Record<string, string> = {}
  const t = title.trim()
  if (t.length < 3 || t.length > 80) {
    errors.title = 'size must be between 3 and 80 characters'
  }
  const n = Number(capacity)
  if (!Number.isInteger(n) || n < 1 || n > 500) {
    errors.capacity = 'must be a whole number between 1 and 500'
  }
  const isValid = Object.keys(errors).length === 0

  return (
    <div>
      <SectionHeading
        title="Perimeter Request Validation (JSR-380)"
        subtitle="Validating constraints at the controller edge rejects malformed requests with 400 Bad Request before database queries or business operations run."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="course-title-input" className="block text-xs font-mono font-semibold uppercase tracking-wider muted mb-1">
              Course Title (@NotBlank, @Size(min=3, max=80))
            </label>
            <input
              id="course-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border hairline bg-transparent p-3 font-mono text-sm rounded-sm focus:border-amber"
              placeholder="e.g. Core Java"
            />
          </div>

          <div>
            <label htmlFor="course-capacity-input" className="block text-xs font-mono font-semibold uppercase tracking-wider muted mb-1">
              Capacity (@Min(1), @Max(500))
            </label>
            <input
              id="course-capacity-input"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full border hairline bg-transparent p-3 font-mono text-sm rounded-sm focus:border-amber"
              placeholder="30"
            />
          </div>

          <div className="pt-2">
            <p className="font-mono text-xs uppercase tracking-widest muted mb-2">Java DTO Definition</p>
            <CodeBlock
              lang="java"
              code={`public record CreateCourseRequest(
  @NotBlank(message = "Title cannot be blank")
  @Size(min = 3, max = 80, message = "Title must be between 3 and 80 characters")
  String title,

  @NotNull(message = "Capacity is required")
  @Min(value = 1, message = "Capacity must be at least 1")
  @Max(value = 500, message = "Capacity cannot exceed 500")
  Integer capacity
) {}`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs uppercase tracking-widest text-amber font-semibold">
              Live Validation Result
            </span>
            <span
              className={`px-2 py-0.5 rounded-sm font-mono text-xs font-bold ${
                isValid ? 'bg-emerald-500 text-ink' : 'bg-rose-500 text-white'
              }`}
            >
              {isValid ? '201 Created' : '400 Bad Request'}
            </span>
          </div>

          <CodeBlock
            lang="json"
            code={
              isValid
                ? JSON.stringify(
                    {
                      id: 104,
                      title: t,
                      capacity: n,
                      enrolled: 0,
                      message: 'Payload passed Bean Validation successfully.',
                    },
                    null,
                    2,
                  )
                : JSON.stringify(
                    {
                      status: 400,
                      error: 'Bad Request',
                      message: 'Validation failed for argument [CreateCourseRequest]',
                      fieldErrors: errors,
                      timestamp: '2026-11-04T18:00:00Z',
                    },
                    null,
                    2,
                  )
            }
          />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 6. Centralized Exception Handling                                          */
/* -------------------------------------------------------------------------- */
function ExceptionsSection() {
  const exceptionCatalog = [
    { ex: 'MethodArgumentNotValidException', status: 400, reason: 'Request body failed validation constraints' },
    { ex: 'BadCredentialsException', status: 401, reason: 'Invalid email or password entered at login' },
    { ex: 'AccessDeniedException', status: 403, reason: 'Caller does not possess the required role authority' },
    { ex: 'ResourceNotFoundException', status: 404, reason: 'Requested course or resource ID does not exist in database' },
    { ex: 'CourseFullException / Conflict', status: 409, reason: 'Student is already enrolled, or course has reached maximum capacity' },
    { ex: 'Exception (Fallback)', status: 500, reason: 'Unhandled internal error; sanitized generic response returned to client' },
  ]

  const [activeIdx, setActiveIdx] = useState(0)
  const current = exceptionCatalog[activeIdx]

  return (
    <div>
      <SectionHeading
        title="Centralized Exception Handling (@RestControllerAdvice)"
        subtitle="A single global error advice class catches all domain exceptions and maps them to clean, predictable RFC-7807 compliant error contracts."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] items-start">
        <ul className="space-y-2">
          {exceptionCatalog.map((r, idx) => (
            <li key={r.ex}>
              <button
                type="button"
                onClick={() => setActiveIdx(idx)}
                className={`w-full flex items-center justify-between p-3.5 border text-left text-xs font-mono transition-all rounded-sm ${
                  idx === activeIdx
                    ? 'border-ink bg-ink text-white font-semibold'
                    : 'hairline card hover:border-amber'
                }`}
              >
                <span className="truncate pr-2">{r.ex}</span>
                <span className="font-bold text-amber">{r.status}</span>
              </button>
            </li>
          ))}
        </ul>

        <div>
          <div className="card p-5 hairline mb-4">
            <p className="text-xs font-mono text-amber font-semibold uppercase tracking-wider">
              HTTP {current.status} Error Contract
            </p>
            <p className="text-sm mt-1">{current.reason}</p>
            <div className="mt-4">
              <CodeBlock
                lang="json"
                code={JSON.stringify(
                  {
                    status: current.status,
                    error: current.ex.replace('Exception', ''),
                    message: current.reason,
                    path: '/api/courses/99',
                    timestamp: new Date().toISOString(),
                  },
                  null,
                  2,
                )}
              />
            </div>
          </div>

          <p className="font-mono text-xs uppercase tracking-widest muted mb-2">
            Spring Controller Advice Implementation
          </p>
          <CodeBlock
            lang="java"
            code={`@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(
      ResourceNotFoundException ex, HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
        new ErrorResponse(404, "Not Found", ex.getMessage(), request.getRequestURI()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(
      AccessDeniedException ex, HttpServletRequest request) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        new ErrorResponse(403, "Forbidden", "Access Denied", request.getRequestURI()));
  }
}`}
          />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* 7. Password Hashing & Cryptography                                         */
/* -------------------------------------------------------------------------- */
const toHex = (buf: ArrayBuffer) =>
  Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')

function HashingSection() {
  const [password, setPassword] = useState('Password@123')
  const [hashOutput, setHashOutput] = useState<{ salt: string; hash: string } | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [hashError, setHashError] = useState('')

  const runHash = async () => {
    setHashError('')
    if (!globalThis.crypto?.subtle) {
      setHashError('Web Crypto API is unavailable in this environment.')
      return
    }

    setIsHashing(true)
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits'],
      )
      const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 120_000, hash: 'SHA-256' },
        key,
        256,
      )
      setHashOutput({ salt: toHex(salt.buffer), hash: toHex(bits) })
    } catch {
      setHashError('Failed to generate hash.')
    } finally {
      setIsHashing(false)
    }
  }

  return (
    <div>
      <SectionHeading
        title="Salted Password Hashing & Cryptography"
        subtitle="Passwords are never stored in plaintext. They are processed through slow, salted one-way key derivation functions resistant against rainbow table lookups and GPU brute-force attacks."
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="password-input" className="block text-xs font-mono font-semibold uppercase tracking-wider muted mb-1">
              Plaintext Password
            </label>
            <input
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border hairline bg-transparent p-3 font-mono text-sm rounded-sm focus:border-amber"
              placeholder="e.g. Password@123"
            />
          </div>

          <button
            type="button"
            onClick={runHash}
            disabled={isHashing || !password}
            className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-semibold text-white transition-all hover:bg-amber hover:text-ink disabled:opacity-50 rounded-sm"
          >
            {isHashing ? <RefreshCw size={14} className="animate-spin" /> : <Hash size={14} />}
            {isHashing ? 'Deriving Key…' : 'Hash Password in Browser'}
          </button>

          <p className="text-xs muted leading-relaxed">
            Live demo computes <strong>PBKDF2-SHA256 with 120,000 iterations</strong> and a cryptographically random 16-byte salt via the browser Web Crypto API. Click twice to see how identical passwords produce entirely different hashes due to salting.
          </p>

          {hashError && <p className="text-xs font-semibold text-rose-500">{hashError}</p>}

          <div className="pt-2">
            <p className="font-mono text-xs uppercase tracking-widest muted mb-2">Spring BCrypt Bean</p>
            <CodeBlock
              lang="java"
              code={`@Bean
public PasswordEncoder passwordEncoder() {
  // Uses BCrypt with 12 rounds of key stretching
  return new BCryptPasswordEncoder(12);
}

// On registration:
String secureHash = passwordEncoder.encode(rawPassword);`}
            />
          </div>
        </div>

        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-amber font-semibold block mb-2">
            Derived Hash & Salt
          </span>
          {hashOutput ? (
            <div className="space-y-4">
              <div className="card p-4 hairline">
                <p className="font-mono text-xs text-amber font-bold uppercase mb-1">
                  Unique Salt (16 bytes random hex):
                </p>
                <p className="font-mono text-xs break-all bg-ink text-white p-2.5 rounded-sm">
                  {hashOutput.salt}
                </p>
              </div>

              <div className="card p-4 hairline">
                <p className="font-mono text-xs text-amber font-bold uppercase mb-1">
                  Derived Hash (PBKDF2-SHA256, 120,000 rounds):
                </p>
                <p className="font-mono text-xs break-all bg-ink text-white p-2.5 rounded-sm">
                  {hashOutput.hash}
                </p>
              </div>
            </div>
          ) : (
            <div className="muted grid min-h-[12rem] place-items-center border border-dashed hairline p-6 text-center text-sm rounded-sm">
              <div>
                <Lock size={24} className="mx-auto mb-2 opacity-40" />
                <p>Click "Hash Password in Browser" to execute key derivation and examine the generated salt and digest.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
