// Example API contract for a course-enrollment style service.
// It drives BOTH the simulated playground and the example OpenAPI documentation,
// so the two can never disagree. It is a teaching/demo contract, not a live service.

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type Access = 'public' | 'authenticated' | 'ADMIN' | 'STUDENT'

export interface Endpoint {
  id: string
  method: Method
  path: string
  summary: string
  access: Access
  body?: Record<string, unknown>
  responses: { status: number; description: string }[]
}

export const endpoints: Endpoint[] = [
  {
    id: 'login',
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Exchange credentials for a signed JWT access token.',
    access: 'public',
    body: { email: 'student@example.com', password: 'Password@123' },
    responses: [
      { status: 200, description: 'Token issued' },
      { status: 400, description: 'Validation failed' },
      { status: 401, description: 'Bad credentials' },
    ],
  },
  {
    id: 'list-courses',
    method: 'GET',
    path: '/api/courses',
    summary: 'List all courses.',
    access: 'authenticated',
    responses: [
      { status: 200, description: 'List of courses' },
      { status: 401, description: 'Missing or invalid token' },
    ],
  },
  {
    id: 'get-course',
    method: 'GET',
    path: '/api/courses/1',
    summary: 'Fetch a single course by id.',
    access: 'authenticated',
    responses: [
      { status: 200, description: 'The course' },
      { status: 401, description: 'Missing or invalid token' },
      { status: 404, description: 'Course not found' },
    ],
  },
  {
    id: 'create-course',
    method: 'POST',
    path: '/api/courses',
    summary: 'Create a course. Admins only.',
    access: 'ADMIN',
    body: { title: 'Spring Security Basics', capacity: 30 },
    responses: [
      { status: 201, description: 'Course created' },
      { status: 400, description: 'Validation failed' },
      { status: 401, description: 'Missing or invalid token' },
      { status: 403, description: 'Caller is not an ADMIN' },
    ],
  },
  {
    id: 'enroll',
    method: 'POST',
    path: '/api/enrollments',
    summary: 'Enroll the signed-in student in a course.',
    access: 'STUDENT',
    body: { courseId: 1 },
    responses: [
      { status: 201, description: 'Enrolled' },
      { status: 401, description: 'Missing or invalid token' },
      { status: 403, description: 'Caller is not a STUDENT' },
      { status: 404, description: 'Course not found' },
      { status: 409, description: 'Already enrolled, or course is full' },
    ],
  },
  {
    id: 'delete-course',
    method: 'DELETE',
    path: '/api/courses/1',
    summary: 'Delete a course. Admins only.',
    access: 'ADMIN',
    responses: [
      { status: 204, description: 'Deleted' },
      { status: 401, description: 'Missing or invalid token' },
      { status: 403, description: 'Caller is not an ADMIN' },
      { status: 404, description: 'Course not found' },
    ],
  },
]

export const sampleUsers = [
  { email: 'student@example.com', password: 'Password@123', role: 'STUDENT' },
  { email: 'admin@example.com', password: 'Password@123', role: 'ADMIN' },
] as const
