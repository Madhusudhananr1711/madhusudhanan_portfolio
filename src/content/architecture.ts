// Illustrative layered structure of a Spring Boot + React application like the
// Course Enrollment and Management System. Snippets are examples of the pattern.

export interface Layer {
  id: string
  name: string
  tech: string
  role: string
  responsibilities: string[]
  snippet: string
  lang: string
}

export const layers: Layer[] = [
  {
    id: 'client',
    name: 'React Client',
    tech: 'React.js · fetch/Axios',
    role: 'Renders the UI and talks to the API over HTTPS.',
    responsibilities: [
      'Sends credentials to the login endpoint and keeps the returned access token.',
      'Attaches the token as an Authorization: Bearer header on every API call.',
      'Shows or hides screens based on the role claim, while the server remains the real authority.',
    ],
    lang: 'ts',
    snippet: `const res = await fetch('/api/courses', {
  headers: { Authorization: \`Bearer \${token}\` },
})
if (res.status === 401) redirectToLogin()`,
  },
  {
    id: 'security',
    name: 'Spring Security + JWT Filter',
    tech: 'Spring Security · JWT',
    role: 'Authenticates every request before it reaches a controller.',
    responsibilities: [
      'A filter reads the Bearer token, verifies its signature and expiry, and rejects bad tokens with 401.',
      'Builds the authenticated principal with its roles and stores it in the SecurityContext.',
      'Authorization rules (RBAC) decide which roles may call which endpoints, returning 403 otherwise.',
    ],
    lang: 'java',
    snippet: `@Override
protected void doFilterInternal(HttpServletRequest req,
    HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
  String token = extractBearer(req);
  if (token != null && jwtService.isValid(token)) {
    SecurityContextHolder.getContext()
        .setAuthentication(jwtService.toAuthentication(token));
  }
  chain.doFilter(req, res);
}`,
  },
  {
    id: 'controller',
    name: 'Controller',
    tech: '@RestController · Bean Validation',
    role: 'Translates HTTP into method calls and back.',
    responsibilities: [
      'Maps URLs and HTTP verbs to handler methods.',
      'Validates request DTOs with @Valid so bad input is rejected at the edge with 400.',
      'Returns ResponseEntity with the right status code; contains no business rules.',
    ],
    lang: 'java',
    snippet: `@PostMapping("/api/courses")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<CourseDto> create(@Valid @RequestBody CreateCourseRequest req) {
  return ResponseEntity.status(HttpStatus.CREATED).body(courseService.create(req));
}`,
  },
  {
    id: 'service',
    name: 'Service',
    tech: '@Service · @Transactional',
    role: 'Holds the business rules.',
    responsibilities: [
      'Enforces rules such as "a student cannot enroll twice" or "a full course rejects enrollment".',
      'Wraps multi-step changes in a transaction so they succeed or fail together.',
      'Throws domain exceptions that a central handler turns into clean error responses.',
    ],
    lang: 'java',
    snippet: `@Transactional
public EnrollmentDto enroll(String email, Long courseId) {
  Course course = courses.findById(courseId)
      .orElseThrow(() -> new NotFoundException("Course " + courseId));
  if (enrollments.existsByStudentEmailAndCourseId(email, courseId))
    throw new ConflictException("Already enrolled");
  return mapper.toDto(enrollments.save(new Enrollment(email, course)));
}`,
  },
  {
    id: 'repository',
    name: 'Repository',
    tech: 'Spring Data JPA · Hibernate',
    role: 'Persistence boundary between Java objects and tables.',
    responsibilities: [
      'Declares queries as interface methods; Spring Data generates the implementation.',
      'Hibernate maps entities to tables and relationships.',
      'Keeps SQL concerns out of services.',
    ],
    lang: 'java',
    snippet: `public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
  boolean existsByStudentEmailAndCourseId(String email, Long courseId);
  List<Enrollment> findByCourseId(Long courseId);
}`,
  },
  {
    id: 'database',
    name: 'MySQL',
    tech: 'MySQL · normalized schema',
    role: 'Durable storage with integrity guarantees.',
    responsibilities: [
      'Normalized tables avoid duplicated data and keep updates consistent.',
      'Primary/foreign keys and unique constraints protect data integrity at the database level.',
      'Indexes on frequently filtered columns support fast lookups.',
    ],
    lang: 'sql',
    snippet: `CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_email VARCHAR(255) NOT NULL,
  course_id BIGINT NOT NULL,
  UNIQUE KEY uq_student_course (student_email, course_id),
  FOREIGN KEY (course_id) REFERENCES course(id)
);`,
  },
]

export const exceptionHandler = {
  name: 'Global exception handler',
  tech: '@RestControllerAdvice',
  description:
    'Any exception thrown in the controller, service or repository is caught here and converted into one consistent JSON error body with the right status code.',
}
