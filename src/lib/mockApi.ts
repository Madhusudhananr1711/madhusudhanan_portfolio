// In-browser safe simulation of REST APIs with JWT & RBAC. No network calls are made.
import { sampleUsers } from '../content/api.ts'

export interface Course {
  id: number
  title: string
  capacity: number
  enrolled: number
}

export interface HospitalWard {
  wardId: string
  wardName: string
  totalBeds: number
  occupiedBeds: number
  availableBeds: number
  status: 'NORMAL' | 'HIGH_CAPACITY' | 'CRITICAL'
}

export interface Db {
  courses: Course[]
  enrollments: { email: string; courseId: number }[]
  hospitalWards: HospitalWard[]
  nextId: number
}

export interface MockRequest {
  method: string
  path: string
  token: string
  bodyText: string
  headers?: Record<string, string>
}

export interface MockResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: unknown
  ms: number
}

export const newDb = (): Db => ({
  courses: [
    { id: 1, title: 'Core Java Fundamentals', capacity: 30, enrolled: 18 },
    { id: 2, title: 'Database Design with MySQL', capacity: 25, enrolled: 25 },
    { id: 3, title: 'Building REST APIs with Spring Boot', capacity: 40, enrolled: 12 },
  ],
  enrollments: [
    { email: 'student@example.com', courseId: 2 },
  ],
  hospitalWards: [
    { wardId: 'EMERGENCY', wardName: 'Emergency Department', totalBeds: 50, occupiedBeds: 39, availableBeds: 11, status: 'NORMAL' },
    { wardId: 'ICU', wardName: 'Intensive Care Unit', totalBeds: 20, occupiedBeds: 18, availableBeds: 2, status: 'HIGH_CAPACITY' },
    { wardId: 'GENERAL_MALE', wardName: 'General Ward (Male)', totalBeds: 60, occupiedBeds: 42, availableBeds: 18, status: 'NORMAL' },
    { wardId: 'GENERAL_FEMALE', wardName: 'General Ward (Female)', totalBeds: 60, occupiedBeds: 45, availableBeds: 15, status: 'NORMAL' },
  ],
  nextId: 4,
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
  const nowIso = new Date().toUTCString()

  const standardHeaders: Record<string, string> = {
    'content-type': 'application/json;charset=UTF-8',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'date': nowIso,
    'x-rate-limit-remaining': '98',
  }

  const done = (status: number, body: unknown, extraHeaders?: Record<string, string>): MockResponse => ({
    status,
    statusText: STATUS[status] ?? '',
    headers: { ...standardHeaders, ...extraHeaders },
    body,
    ms: Math.max(8, Math.round(performance.now() - started + 14 + Math.random() * 26)),
  })

  const err = (status: number, message: string, extra?: Record<string, unknown>) =>
    done(status, {
      status,
      error: STATUS[status],
      message,
      path: req.path.split('?')[0],
      timestamp: new Date().toISOString(),
      ...extra,
    })

  const method = req.method.toUpperCase()
  const [cleanPath, queryString] = req.path.split('?')
  const path = cleanPath.replace(/\/+$/, '') || '/'

  // Parse query params
  const queryParams = new URLSearchParams(queryString || '')

  let json: Record<string, unknown> = {}
  if (req.bodyText && req.bodyText.trim()) {
    try {
      const parsed = JSON.parse(req.bodyText)
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
      json = parsed as Record<string, unknown>
    } catch {
      return err(400, 'Malformed JSON request body: Expected JSON object syntax')
    }
  }

  // --- Public: Login ---
  if (method === 'POST' && path === '/api/auth/login') {
    const errors: Record<string, string> = {}
    const email = typeof json.email === 'string' ? json.email.trim() : ''
    const password = typeof json.password === 'string' ? json.password : ''

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'must be a well-formed email address'
    }
    if (password.length < 8) {
      errors.password = 'size must be at least 8 characters'
    }
    if (Object.keys(errors).length) {
      return err(400, 'Validation failed: Invalid credentials format', { fieldErrors: errors })
    }

    const user = sampleUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!user) {
      return err(401, 'Bad credentials: Email or password does not match registered records')
    }

    return done(200, {
      tokenType: 'Bearer',
      accessToken: signDemoToken(user.email, user.role),
      expiresInSeconds: 3600,
      role: user.role,
      user: {
        email: user.email,
        role: user.role,
        label: user.label,
      },
    })
  }

  // --- Protected Endpoints Check ---
  const courseMatch = path.match(/^\/api\/courses\/(\d+)$/)
  const isCourseCollection = path === '/api/courses'
  const isEnrollments = path === '/api/enrollments'
  const isHospitalForecast = path === '/api/analytics/patient-flow/forecast'
  const isHospitalCapacity = path === '/api/hospital/departments/capacity'

  const isKnown = isCourseCollection || courseMatch || isEnrollments || isHospitalForecast || isHospitalCapacity

  if (!isKnown) {
    return err(404, `No mapping found for ${method} ${path}`)
  }

  // Check Bearer Token
  const principal = req.token ? readDemoToken(req.token) : null
  if (!principal) {
    return err(401, 'Full authentication is required to access this resource: Missing, expired or invalid Bearer JWT')
  }

  // --- GET /api/courses ---
  if (method === 'GET' && isCourseCollection) {
    const search = queryParams.get('search')?.toLowerCase()
    let result = db.courses
    if (search) {
      result = result.filter((c) => c.title.toLowerCase().includes(search))
    }
    return done(200, result)
  }

  // --- GET /api/courses/{id} ---
  if (method === 'GET' && courseMatch) {
    const id = Number(courseMatch[1])
    const c = db.courses.find((x) => x.id === id)
    return c ? done(200, c) : err(404, `Course with ID ${id} not found in database`)
  }

  // --- POST /api/courses (ADMIN only) ---
  if (method === 'POST' && isCourseCollection) {
    if (principal.role !== 'ADMIN') {
      return err(403, 'Access Denied: Endpoint requires ROLE_ADMIN authority')
    }
    const errors: Record<string, string> = {}
    const title = typeof json.title === 'string' ? json.title.trim() : ''
    const capacity = json.capacity

    if (title.length < 3 || title.length > 80) {
      errors.title = 'size must be between 3 and 80 characters'
    }
    if (typeof capacity !== 'number' || !Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      errors.capacity = 'must be a whole number between 1 and 500'
    }
    if (Object.keys(errors).length) {
      return err(400, 'Validation failed: Course parameters violated constraints', { fieldErrors: errors })
    }

    const course: Course = { id: db.nextId++, title, capacity: capacity as number, enrolled: 0 }
    db.courses.push(course)
    return done(201, course)
  }

  // --- POST /api/enrollments (STUDENT only) ---
  if (method === 'POST' && isEnrollments) {
    if (principal.role !== 'STUDENT') {
      return err(403, 'Access Denied: Only students with ROLE_STUDENT can enroll in courses')
    }
    const courseId = json.courseId
    if (typeof courseId !== 'number' || !Number.isInteger(courseId)) {
      return err(400, 'Validation failed', { fieldErrors: { courseId: 'must be a valid integer' } })
    }

    const course = db.courses.find((c) => c.id === courseId)
    if (!course) {
      return err(404, `Course ${courseId} not found`)
    }
    if (db.enrollments.some((e) => e.email === principal.sub && e.courseId === courseId)) {
      return err(409, `Student ${principal.sub} is already enrolled in course "${course.title}"`)
    }
    if (course.enrolled >= course.capacity) {
      return err(409, `Enrollment rejected: Course "${course.title}" has reached its maximum capacity of ${course.capacity}`)
    }

    course.enrolled += 1
    db.enrollments.push({ email: principal.sub, courseId })
    return done(201, {
      enrollmentId: db.enrollments.length + 100,
      studentEmail: principal.sub,
      courseId: course.id,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString(),
      status: 'CONFIRMED',
    })
  }

  // --- DELETE /api/courses/{id} (ADMIN only) ---
  if (method === 'DELETE' && courseMatch) {
    if (principal.role !== 'ADMIN') {
      return err(403, 'Access Denied: Endpoint requires ROLE_ADMIN authority')
    }
    const id = Number(courseMatch[1])
    const idx = db.courses.findIndex((c) => c.id === id)
    if (idx === -1) {
      return err(404, `Course ${id} not found`)
    }
    db.courses.splice(idx, 1)
    db.enrollments = db.enrollments.filter((e) => e.courseId !== id)
    return done(204, null)
  }

  // --- GET /api/analytics/patient-flow/forecast (Authenticated) ---
  if (method === 'GET' && isHospitalForecast) {
    const hours = parseInt(queryParams.get('hours') || '12', 10) || 12
    const wardId = queryParams.get('wardId') || 'EMERGENCY_DEPT'
    const peakHour = (new Date().getHours() + 3) % 24
    const peakHourStr = `${peakHour.toString().padStart(2, '0')}:00`

    return done(200, {
      wardId,
      horizonHours: hours,
      modelArchitecture: 'Bidirectional-LSTM-Time-Series-v2',
      validationAccuracy: '90.4%',
      featuresUsed: ['hourly_lag_24', 'cyclical_sin_cos', 'day_of_week', 'triage_trend'],
      forecastGeneratedAt: new Date().toISOString(),
      predictedTotalArrivals: Math.round(hours * 3.8),
      predictedPeakHour: peakHourStr,
      currentOccupancyPct: 78,
      capacitySurgeAlert: false,
      recommendedOnShiftNurses: Math.max(3, Math.ceil((hours * 3.8) / 8)),
      note: 'Simulated output from ML time-series model pipeline for hospital resource planning.',
    })
  }

  // --- GET /api/hospital/departments/capacity (HOSPITAL_ADMIN only) ---
  if (method === 'GET' && isHospitalCapacity) {
    if (principal.role !== 'HOSPITAL_ADMIN' && principal.role !== 'ADMIN') {
      return err(403, 'Access Denied: Endpoint requires ROLE_HOSPITAL_ADMIN authority')
    }
    return done(200, db.hospitalWards)
  }

  return err(405, `Method ${method} is not supported for ${path}`)
}
