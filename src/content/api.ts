// API contract for portfolio demonstrations (Course Enrollment & Hospital Flow systems).
// Powers the API Playground, Security RBAC demos, and OpenAPI documentation.
// Simulated in-browser for safe, zero-credential interactive exploration.

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
export type Access = 'public' | 'authenticated' | 'ADMIN' | 'STUDENT' | 'HOSPITAL_ADMIN'

export interface ParameterSpec {
  name: string
  in: 'path' | 'query' | 'header'
  required: boolean
  type: string
  description: string
  example?: string | number
}

export interface Endpoint {
  id: string
  tag: 'Authentication' | 'Courses' | 'Enrollments' | 'Hospital Analytics'
  method: Method
  path: string
  summary: string
  description?: string
  access: Access
  parameters?: ParameterSpec[]
  headers?: Record<string, string>
  body?: Record<string, unknown>
  bodySchema?: Record<string, { type: string; required: boolean; description: string }>
  responses: { status: number; description: string; example?: unknown }[]
}

export const endpoints: Endpoint[] = [
  {
    id: 'login',
    tag: 'Authentication',
    method: 'POST',
    path: '/api/auth/login',
    summary: 'Exchange credentials for a signed JWT access token.',
    description: 'Authenticates a user by email and password, returning an HMAC-SHA256 signed JWT with role claims and 1-hour expiration.',
    access: 'public',
    headers: { 'Content-Type': 'application/json' },
    body: { email: 'student@example.com', password: 'Password@123' },
    bodySchema: {
      email: { type: 'string (email)', required: true, description: 'Registered user email address' },
      password: { type: 'string', required: true, description: 'Account password (minimum 8 characters)' },
    },
    responses: [
      {
        status: 200,
        description: 'Token successfully issued',
        example: {
          tokenType: 'Bearer',
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NjIyOTAwMDAsImV4cCI6MTc2MjI5MzYwMH0.SIMULATED_SIGNATURE',
          expiresInSeconds: 3600,
          role: 'STUDENT',
        },
      },
      {
        status: 400,
        description: 'Validation failed (malformed email or short password)',
        example: { status: 400, error: 'Bad Request', message: 'Validation failed', fieldErrors: { email: 'must be a well-formed email address' } },
      },
      {
        status: 401,
        description: 'Bad credentials (unregistered email or incorrect password)',
        example: { status: 401, error: 'Unauthorized', message: 'Bad credentials', path: '/api/auth/login' },
      },
    ],
  },
  {
    id: 'list-courses',
    tag: 'Courses',
    method: 'GET',
    path: '/api/courses',
    summary: 'List all available courses with current enrollment figures.',
    description: 'Retrieves the complete catalog of courses. Requires an authenticated Bearer token.',
    access: 'authenticated',
    parameters: [
      { name: 'search', in: 'query', required: false, type: 'string', description: 'Filter courses by title substring' },
    ],
    responses: [
      {
        status: 200,
        description: 'List of active courses',
        example: [
          { id: 1, title: 'Core Java Fundamentals', capacity: 30, enrolled: 18 },
          { id: 2, title: 'Database Design with MySQL', capacity: 25, enrolled: 25 },
          { id: 3, title: 'Building REST APIs with Spring Boot', capacity: 40, enrolled: 12 },
        ],
      },
      { status: 401, description: 'Missing or expired Bearer token' },
    ],
  },
  {
    id: 'get-course',
    tag: 'Courses',
    method: 'GET',
    path: '/api/courses/1',
    summary: 'Fetch a single course by its ID.',
    description: 'Returns detailed information for a specific course identified by its numeric path variable.',
    access: 'authenticated',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'integer', description: 'Unique identifier of the course', example: 1 },
    ],
    responses: [
      {
        status: 200,
        description: 'Course details retrieved',
        example: { id: 1, title: 'Core Java Fundamentals', capacity: 30, enrolled: 18 },
      },
      { status: 401, description: 'Missing or expired Bearer token' },
      {
        status: 404,
        description: 'Course with specified ID does not exist',
        example: { status: 404, error: 'Not Found', message: 'Course 999 not found', path: '/api/courses/999' },
      },
    ],
  },
  {
    id: 'create-course',
    tag: 'Courses',
    method: 'POST',
    path: '/api/courses',
    summary: 'Create a new course offering. Requires ADMIN role.',
    description: 'Adds a new course record to the database. Validates title length and capacity bounds. Restriced to administrators.',
    access: 'ADMIN',
    headers: { 'Content-Type': 'application/json' },
    body: { title: 'Spring Security & OAuth2 Deep Dive', capacity: 35 },
    bodySchema: {
      title: { type: 'string', required: true, description: 'Course title (3 to 80 characters)' },
      capacity: { type: 'integer', required: true, description: 'Maximum student capacity (1 to 500)' },
    },
    responses: [
      {
        status: 201,
        description: 'Course created successfully',
        example: { id: 4, title: 'Spring Security & OAuth2 Deep Dive', capacity: 35, enrolled: 0 },
      },
      {
        status: 400,
        description: 'Validation failed on title or capacity constraints',
        example: { status: 400, error: 'Bad Request', message: 'Validation failed', fieldErrors: { capacity: 'must be a whole number between 1 and 500' } },
      },
      { status: 401, description: 'Missing or expired Bearer token' },
      {
        status: 403,
        description: 'Caller does not possess ROLE_ADMIN privilege',
        example: { status: 403, error: 'Forbidden', message: 'Access Denied: requires ROLE_ADMIN', path: '/api/courses' },
      },
    ],
  },
  {
    id: 'enroll',
    tag: 'Enrollments',
    method: 'POST',
    path: '/api/enrollments',
    summary: 'Enroll the authenticated student into a course.',
    description: 'Creates a new student enrollment record within an atomic transaction. Enforces capacity limits and unique constraints.',
    access: 'STUDENT',
    headers: { 'Content-Type': 'application/json' },
    body: { courseId: 1 },
    bodySchema: {
      courseId: { type: 'integer', required: true, description: 'Numeric ID of the course to enroll in' },
    },
    responses: [
      {
        status: 201,
        description: 'Successfully enrolled into course',
        example: { enrollmentId: 101, student: 'student@example.com', course: 'Core Java Fundamentals', timestamp: '2026-11-04T18:00:00Z' },
      },
      { status: 400, description: 'Malformed JSON or invalid courseId type' },
      { status: 401, description: 'Missing or expired Bearer token' },
      { status: 403, description: 'Caller does not possess ROLE_STUDENT' },
      { status: 404, description: 'Specified courseId does not exist' },
      {
        status: 409,
        description: 'Conflict: student already enrolled or course reached capacity',
        example: { status: 409, error: 'Conflict', message: 'Student is already enrolled in this course', path: '/api/enrollments' },
      },
    ],
  },
  {
    id: 'delete-course',
    tag: 'Courses',
    method: 'DELETE',
    path: '/api/courses/1',
    summary: 'Delete a course by ID. Requires ADMIN role.',
    description: 'Removes an existing course offering and its associated enrollment relations. Restriced to administrators.',
    access: 'ADMIN',
    parameters: [
      { name: 'id', in: 'path', required: true, type: 'integer', description: 'ID of the course to remove', example: 1 },
    ],
    responses: [
      { status: 204, description: 'Course successfully deleted (No Content)' },
      { status: 401, description: 'Missing or expired Bearer token' },
      { status: 403, description: 'Caller is not an ADMIN' },
      { status: 404, description: 'Course with given ID does not exist' },
    ],
  },
  {
    id: 'hospital-forecast',
    tag: 'Hospital Analytics',
    method: 'GET',
    path: '/api/analytics/patient-flow/forecast',
    summary: 'Retrieve LSTM time-series forecast of patient inflow.',
    description: 'Fetches AI model predictions for emergency department arrivals across the upcoming 6-24 hour window.',
    access: 'authenticated',
    parameters: [
      { name: 'hours', in: 'query', required: false, type: 'integer', description: 'Forecast horizon in hours (6, 12, or 24)', example: 12 },
      { name: 'wardId', in: 'query', required: false, type: 'string', description: 'Ward identifier (e.g. EMERGENCY_DEPT, ICU)', example: 'EMERGENCY_DEPT' },
    ],
    responses: [
      {
        status: 200,
        description: 'Inflow forecast generated with 90% validated model accuracy',
        example: {
          wardId: 'EMERGENCY_DEPT',
          horizonHours: 12,
          model: 'Bidirectional-LSTM-v2',
          validationAccuracy: '90.4%',
          predictedPeakHour: '21:00',
          predictedTotalArrivals: 48,
          currentOccupancyPct: 78,
          capacitySurgeAlert: false,
          recommendedOnShiftNurses: 6,
        },
      },
      { status: 401, description: 'Missing or expired Bearer token' },
    ],
  },
  {
    id: 'hospital-capacity',
    tag: 'Hospital Analytics',
    method: 'GET',
    path: '/api/hospital/departments/capacity',
    summary: 'Get real-time ward capacity and bed availability. Requires HOSPITAL_ADMIN.',
    description: 'Queries indexed MySQL tables to return live bed counts, active admissions, and resource utilization across all hospital wings.',
    access: 'HOSPITAL_ADMIN',
    responses: [
      {
        status: 200,
        description: 'Current capacity metrics retrieved in 18ms via normalized index',
        example: [
          { wardId: 'EMERGENCY', wardName: 'Emergency Department', totalBeds: 50, occupiedBeds: 39, availableBeds: 11, status: 'NORMAL' },
          { wardId: 'ICU', wardName: 'Intensive Care Unit', totalBeds: 20, occupiedBeds: 18, availableBeds: 2, status: 'HIGH_CAPACITY' },
          { wardId: 'GENERAL_MALE', wardName: 'General Ward (Male)', totalBeds: 60, occupiedBeds: 42, availableBeds: 18, status: 'NORMAL' },
        ],
      },
      { status: 401, description: 'Missing or expired Bearer token' },
      {
        status: 403,
        description: 'Access denied: requires ROLE_HOSPITAL_ADMIN or ROLE_ADMIN',
        example: { status: 403, error: 'Forbidden', message: 'Access Denied: requires ROLE_HOSPITAL_ADMIN', path: '/api/hospital/departments/capacity' },
      },
    ],
  },
]

export const sampleUsers = [
  { email: 'student@example.com', password: 'Password@123', role: 'STUDENT', label: 'Student' },
  { email: 'admin@example.com', password: 'Password@123', role: 'ADMIN', label: 'Course Admin' },
  { email: 'hospital_admin@example.com', password: 'Password@123', role: 'HOSPITAL_ADMIN', label: 'Hospital Admin' },
] as const
