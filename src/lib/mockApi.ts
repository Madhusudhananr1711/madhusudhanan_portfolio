// In-browser SIMULATION of the example API. No network request is ever made.
import { sampleUsers } from '../content/api'

export interface Course {
  id: number
  title: string
  capacity: number
  enrolled: number
}
export interface Db {
  courses: Course[]
  enrollments: { email: string; courseId: number }[]
  nextId: number
}
export interface MockRequest {
  method: string
  path: string
  token: string
  bodyText: string
}
export interface MockResponse {
  status: number
  statusText: string
  body: unknown
  ms: number
}

export const newDb = (): Db => ({
  courses: [
    { id: 1, title: 'Core Java Fundamentals', capacity: 2, enrolled: 0 },
    { id: 2, title: 'Database Design with MySQL', capacity: 25, enrolled: 0 },
  ],
  enrollments: [],
  nextId: 3,
})

const b64url = (obj: unknown) =>
  btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')

const fromB64url = (s: string) => {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(atob(pad + '='.repeat((4 - (pad.length % 4)) % 4)))
}

export function signDemoToken(email: string, role: string): string {
  const now = Math.floor(Date.now() / 1000)
  return [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({ sub: email, role, iat: now, exp: now + 3600 }),
    'SIMULATED_SIGNATURE',
  ].join('.')
}

export function readDemoToken(token: string): { sub: string; role: string } | null {
  const parts = token.replace(/^Bearer\s+/i, '').trim().split('.')
  if (parts.length !== 3 || parts[2] !== 'SIMULATED_SIGNATURE') return null
  try {
    const p = fromB64url(parts[1])
    if (typeof p.exp !== 'number' || p.exp < Date.now() / 1000) return null
    return { sub: String(p.sub), role: String(p.role) }
  } catch {
    return null
  }
}

const STATUS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
}

export function handleRequest(req: MockRequest, db: Db): MockResponse {
  const started = performance.now()
  const done = (status: number, body: unknown): MockResponse => ({
    status,
    statusText: STATUS[status] ?? '',
    body,
    ms: Math.max(1, Math.round(performance.now() - started + 12 + Math.random() * 30)),
  })
  const err = (status: number, message: string, extra?: Record<string, unknown>) =>
    done(status, { status, error: STATUS[status], message, path: req.path, ...extra })

  const method = req.method.toUpperCase()
  const path = req.path.split('?')[0].replace(/\/+$/, '') || '/'

  let json: Record<string, unknown> = {}
  if (req.bodyText.trim()) {
    try {
      const parsed = JSON.parse(req.bodyText)
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
      json = parsed as Record<string, unknown>
    } catch {
      return err(400, 'Malformed JSON request body')
    }
  }

  // --- public ---
  if (method === 'POST' && path === '/api/auth/login') {
    const errors: Record<string, string> = {}
    const email = typeof json.email === 'string' ? json.email : ''
    const password = typeof json.password === 'string' ? json.password : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'must be a well-formed email address'
    if (password.length < 8) errors.password = 'size must be at least 8 characters'
    if (Object.keys(errors).length) return err(400, 'Validation failed', { fieldErrors: errors })
    const user = sampleUsers.find((u) => u.email === email && u.password === password)
    if (!user) return err(401, 'Bad credentials')
    return done(200, {
      tokenType: 'Bearer',
      accessToken: signDemoToken(user.email, user.role),
      expiresInSeconds: 3600,
      role: user.role,
    })
  }

  // --- everything below needs a valid token ---
  const known = ['/api/courses', '/api/enrollments']
  const courseMatch = path.match(/^\/api\/courses\/(\d+)$/)
  const isKnown = known.includes(path) || courseMatch

  if (!isKnown) return err(404, `No mapping for ${method} ${path}`)

  const principal = req.token ? readDemoToken(req.token) : null
  if (!principal) return err(401, 'Full authentication is required to access this resource')

  if (method === 'GET' && path === '/api/courses') return done(200, db.courses)

  if (method === 'GET' && courseMatch) {
    const c = db.courses.find((x) => x.id === Number(courseMatch[1]))
    return c ? done(200, c) : err(404, `Course ${courseMatch[1]} not found`)
  }

  if (method === 'POST' && path === '/api/courses') {
    if (principal.role !== 'ADMIN') return err(403, 'Access Denied: requires ROLE_ADMIN')
    const errors: Record<string, string> = {}
    const title = typeof json.title === 'string' ? json.title.trim() : ''
    const capacity = json.capacity
    if (title.length < 3 || title.length > 80) errors.title = 'size must be between 3 and 80'
    if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1 || capacity > 500)
      errors.capacity = 'must be a whole number between 1 and 500'
    if (Object.keys(errors).length) return err(400, 'Validation failed', { fieldErrors: errors })
    const course: Course = { id: db.nextId++, title, capacity: capacity as number, enrolled: 0 }
    db.courses.push(course)
    return done(201, course)
  }

  if (method === 'POST' && path === '/api/enrollments') {
    if (principal.role !== 'STUDENT') return err(403, 'Access Denied: requires ROLE_STUDENT')
    const courseId = json.courseId
    if (typeof courseId !== 'number' || !Number.isInteger(courseId))
      return err(400, 'Validation failed', { fieldErrors: { courseId: 'must be a whole number' } })
    const course = db.courses.find((c) => c.id === courseId)
    if (!course) return err(404, `Course ${courseId} not found`)
    if (db.enrollments.some((e) => e.email === principal.sub && e.courseId === courseId))
      return err(409, 'Student is already enrolled in this course')
    if (course.enrolled >= course.capacity) return err(409, 'Course is full')
    course.enrolled += 1
    db.enrollments.push({ email: principal.sub, courseId })
    return done(201, { enrollmentId: db.enrollments.length, student: principal.sub, course: course.title })
  }

  if (method === 'DELETE' && courseMatch) {
    if (principal.role !== 'ADMIN') return err(403, 'Access Denied: requires ROLE_ADMIN')
    const id = Number(courseMatch[1])
    const idx = db.courses.findIndex((c) => c.id === id)
    if (idx === -1) return err(404, `Course ${id} not found`)
    db.courses.splice(idx, 1)
    db.enrollments = db.enrollments.filter((e) => e.courseId !== id)
    return done(204, null)
  }

  return err(405 as number, `${method} is not supported for ${path}`)
}
