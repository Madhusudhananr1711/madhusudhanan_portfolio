import assert from 'node:assert'
import { endpoints, sampleUsers } from './src/content/api.ts'
import { newDb, handleRequest, readDemoToken } from './src/lib/mockApi.ts'
import { courseEnrollmentSystem, hospitalPatientFlowSystem } from './src/content/architecture.ts'
import { buildOpenApiSpec } from './src/lib/openApiSpec.ts'

console.log('🧪 Starting Verification Test Suite...\n')

// 1. Verify Sample Users
console.log('1. Checking Sample Users...')
assert.strictEqual(sampleUsers.length, 3, 'Must have 3 sample users (Student, Admin, Hospital Admin)')
const roles = sampleUsers.map((u) => u.role)
assert.ok(roles.includes('STUDENT'), 'Must have STUDENT role')
assert.ok(roles.includes('ADMIN'), 'Must have ADMIN role')
assert.ok(roles.includes('HOSPITAL_ADMIN'), 'Must have HOSPITAL_ADMIN role')
console.log('   ✅ Sample users OK')

// 2. Test mockApi Auth Login
console.log('2. Testing Mock API Login...')
const db = newDb()
const loginRes = handleRequest(
  {
    method: 'POST',
    path: '/api/auth/login',
    token: '',
    bodyText: JSON.stringify({ email: 'student@example.com', password: 'Password@123' }),
  },
  db,
)
assert.strictEqual(loginRes.status, 200, 'Login should return 200')
const token = loginRes.body.accessToken
assert.ok(token, 'Login should return an accessToken')
const principal = readDemoToken(token)
assert.strictEqual(principal.sub, 'student@example.com')
assert.strictEqual(principal.role, 'STUDENT')
console.log('   ✅ Login & JWT Generation OK')

// 3. Test 401 Unauthorized (No Token)
console.log('3. Testing 401 Unauthorized...')
const unauthRes = handleRequest(
  {
    method: 'GET',
    path: '/api/courses',
    token: '',
    bodyText: '',
  },
  db,
)
assert.strictEqual(unauthRes.status, 401, 'Protected GET /api/courses without token must return 401')
console.log('   ✅ 401 Unauthorized OK')

// 4. Test 403 Forbidden (Student trying to create a course)
console.log('4. Testing 403 Forbidden...')
const forbiddenRes = handleRequest(
  {
    method: 'POST',
    path: '/api/courses',
    token,
    bodyText: JSON.stringify({ title: 'Unauthorized Course', capacity: 30 }),
  },
  db,
)
assert.strictEqual(forbiddenRes.status, 403, 'Student trying to POST /api/courses must return 403')
console.log('   ✅ 403 Forbidden OK')

// 5. Test 400 Validation Error (Bad title / capacity)
console.log('5. Testing 400 Validation Error...')
const adminLoginRes = handleRequest(
  {
    method: 'POST',
    path: '/api/auth/login',
    token: '',
    bodyText: JSON.stringify({ email: 'admin@example.com', password: 'Password@123' }),
  },
  db,
)
const adminToken = adminLoginRes.body.accessToken
const badValidationRes = handleRequest(
  {
    method: 'POST',
    path: '/api/courses',
    token: adminToken,
    bodyText: JSON.stringify({ title: 'A', capacity: 9999 }),
  },
  db,
)
assert.strictEqual(badValidationRes.status, 400, 'Invalid title and capacity must return 400')
assert.ok(badValidationRes.body.fieldErrors.title, 'Must contain title validation error')
assert.ok(badValidationRes.body.fieldErrors.capacity, 'Must contain capacity validation error')
console.log('   ✅ 400 Validation Error OK')

// 6. Test Successful Admin Course Creation
console.log('6. Testing Successful Course Creation (Admin)...')
const createRes = handleRequest(
  {
    method: 'POST',
    path: '/api/courses',
    token: adminToken,
    bodyText: JSON.stringify({ title: 'Advanced Spring Security', capacity: 25 }),
  },
  db,
)
assert.strictEqual(createRes.status, 201, 'Valid course creation must return 201')
assert.strictEqual(createRes.body.title, 'Advanced Spring Security')
console.log('   ✅ Course Creation OK')

// 7. Test Student Enrollment & 409 Conflict (Duplicate enrollment)
console.log('7. Testing Enrollment & 409 Conflict...')
const enrollRes = handleRequest(
  {
    method: 'POST',
    path: '/api/enrollments',
    token,
    bodyText: JSON.stringify({ courseId: 1 }),
  },
  db,
)
assert.strictEqual(enrollRes.status, 201, 'First enrollment must return 201')
const dupEnrollRes = handleRequest(
  {
    method: 'POST',
    path: '/api/enrollments',
    token,
    bodyText: JSON.stringify({ courseId: 1 }),
  },
  db,
)
assert.strictEqual(dupEnrollRes.status, 409, 'Duplicate enrollment must return 409 Conflict')
console.log('   ✅ Enrollment & Conflict OK')

// 8. Test Hospital Analytics Forecast & Capacity
console.log('8. Testing Hospital Analytics Endpoints...')
const hospitalForecastRes = handleRequest(
  {
    method: 'GET',
    path: '/api/analytics/patient-flow/forecast?hours=12',
    token,
    bodyText: '',
  },
  db,
)
assert.strictEqual(hospitalForecastRes.status, 200, 'Forecast endpoint should return 200')
assert.strictEqual(hospitalForecastRes.body.validationAccuracy, '90.4%')

// Student should get 403 on hospital capacity
const studentCapacityRes = handleRequest(
  {
    method: 'GET',
    path: '/api/hospital/departments/capacity',
    token,
    bodyText: '',
  },
  db,
)
assert.strictEqual(studentCapacityRes.status, 403, 'Student must get 403 on hospital capacity')

// Hospital admin should get 200
const hospLoginRes = handleRequest(
  {
    method: 'POST',
    path: '/api/auth/login',
    token: '',
    bodyText: JSON.stringify({ email: 'hospital_admin@example.com', password: 'Password@123' }),
  },
  db,
)
const hospToken = hospLoginRes.body.accessToken
const hospCapacityRes = handleRequest(
  {
    method: 'GET',
    path: '/api/hospital/departments/capacity',
    token: hospToken,
    bodyText: '',
  },
  db,
)
assert.strictEqual(hospCapacityRes.status, 200, 'Hospital admin must get 200 on hospital capacity')
assert.ok(Array.isArray(hospCapacityRes.body))
console.log('   ✅ Hospital Analytics & RBAC OK')

// 9. Check Architecture Systems
console.log('9. Checking Architecture Systems Data...')
assert.strictEqual(courseEnrollmentSystem.layers.length, 6, 'Course Enrollment system has 6 layers')
assert.strictEqual(hospitalPatientFlowSystem.layers.length, 6, 'Patient Flow system has 6 layers')
assert.ok(courseEnrollmentSystem.crossCutting.length >= 5, 'Course system has cross-cutting concerns')
assert.ok(hospitalPatientFlowSystem.crossCutting.length >= 3, 'Hospital system has cross-cutting concerns')
console.log('   ✅ Architecture Systems OK')

// 10. Check OpenAPI 3.0.3 Spec Generation
console.log('10. Checking OpenAPI 3.0.3 Spec Generator...')
const oas = buildOpenApiSpec()
assert.strictEqual(oas.openapi, '3.0.3')
assert.ok(oas.paths['/api/auth/login'])
assert.ok(oas.paths['/api/courses'])
assert.ok(oas.paths['/api/enrollments'])
assert.ok(oas.paths['/api/analytics/patient-flow/forecast'])
assert.ok(oas.paths['/api/hospital/departments/capacity'])
console.log('   ✅ OpenAPI 3.0.3 Spec OK')

console.log('\n🎉 ALL 10 VERIFICATION TEST SUITES PASSED PERFECTLY!')
