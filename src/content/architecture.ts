// System architecture definitions for portfolio projects:
// 1. Course Enrollment and Management System (Spring Boot + React)
// 2. AI-Based Patient Flow Prediction and Hospital Resource Management (Python + LSTM + REST + MySQL)

export interface ArchitectureLayer {
  id: string
  name: string
  tech: string
  role: string
  responsibilities: string[]
  snippet: string
  lang: string
  type: 'frontend' | 'security' | 'api' | 'business' | 'persistence' | 'database' | 'ml'
}

export interface CrossCuttingConcern {
  id: string
  title: string
  concept: string
  implementation: string
  benefit: string
  codeSnippet: string
  lang: string
}

export interface ArchitectureSystem {
  id: string
  title: string
  subtitle: string
  badge: string
  summary: string
  layers: ArchitectureLayer[]
  crossCutting: CrossCuttingConcern[]
}

export const courseEnrollmentSystem: ArchitectureSystem = {
  id: 'course-enrollment',
  title: 'Course Enrollment and Management System',
  subtitle: 'Enterprise Full-Stack Architecture · Spring Boot 3 & React',
  badge: 'Production-Style Tiered Architecture',
  summary:
    'A robust, multi-tier monolithic architecture designed with clear separation of concerns. Requests flow from a React SPA through a stateless JWT security filter, into validated REST controllers, transactional business services, JPA repositories, and normalized MySQL tables.',
  layers: [
    {
      id: 'client',
      name: 'React 19 Client SPA',
      tech: 'React · TypeScript · Tailwind CSS · Axios/Fetch',
      role: 'Renders the responsive user interface, manages state, and orchestrates client-side routing and token lifecycle.',
      responsibilities: [
        'Collects student/admin credentials and receives signed JWT access tokens.',
        'Injects Authorization: Bearer <token> in HTTP request headers via interceptors.',
        'Provides instant client-side route guards based on JWT role claims, while relying strictly on server-side authority.',
        'Handles 401 Unauthorized by clearing session state and gracefully routing to login.',
      ],
      lang: 'ts',
      type: 'frontend',
      snippet: `// Client-side API client with JWT bearer interceptor
const apiClient = axios.create({ baseURL: '/api' });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = \`Bearer \${token}\`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);`,
    },
    {
      id: 'security',
      name: 'Spring Security 6 & JWT Filter',
      tech: 'Spring Security · OncePerRequestFilter · JJWT',
      role: 'Intercepts incoming HTTP requests, validates token signatures, and populates the SecurityContextHolder before reaching controllers.',
      responsibilities: [
        'Extracts the Bearer JWT token from the Authorization header.',
        'Validates token cryptographic signature using HMAC-SHA256 and checks expiration claims.',
        'Constructs an authenticated UsernamePasswordAuthenticationToken and sets it in SecurityContextHolder.',
        'Rejects missing, expired, or tampered tokens with a structured 401 Unauthorized before controllers run.',
      ],
      lang: 'java',
      type: 'security',
      snippet: `@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtTokenService jwtTokenService;
  private final UserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
    final String authHeader = request.getHeader("Authorization");
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      String token = authHeader.substring(7);
      if (jwtTokenService.isTokenValid(token)) {
        String username = jwtTokenService.extractUsername(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        var authToken = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
      }
    }
    filterChain.doFilter(request, response);
  }
}`,
    },
    {
      id: 'controller',
      name: 'REST Controller Layer',
      tech: '@RestController · @PreAuthorize · Bean Validation (JSR-380)',
      role: 'Exposes HTTP endpoints, enforces role-based access control (RBAC), and validates payload schemas.',
      responsibilities: [
        'Maps HTTP verbs (GET, POST, PUT, DELETE) and URL paths to Java methods.',
        'Enforces method-level authorization using @PreAuthorize("hasRole(\'ADMIN\')").',
        'Validates request DTOs at the perimeter using @Valid (@NotBlank, @Size, @Min, @Max).',
        'Returns typed ResponseEntity with appropriate HTTP status codes (200, 201, 204).',
      ],
      lang: 'java',
      type: 'api',
      snippet: `@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

  private final CourseService courseService;

  @PostMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<CourseResponseDto> createCourse(
      @Valid @RequestBody CreateCourseRequest request) {
    CourseResponseDto created = courseService.createCourse(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @GetMapping
  public ResponseEntity<List<CourseResponseDto>> getAllCourses() {
    return ResponseEntity.ok(courseService.getAllCourses());
  }
}`,
    },
    {
      id: 'service',
      name: 'Service Layer (Business Logic)',
      tech: '@Service · @Transactional · Domain Exceptions',
      role: 'Encapsulates business rules, orchestrates data transformations, and controls database transactions.',
      responsibilities: [
        'Enforces domain invariants: verifies course existence, validates capacity, prevents duplicate enrollment.',
        'Demarcates atomic transaction boundaries with @Transactional to ensure rollbacks on errors.',
        'Throws semantic business exceptions (e.g. CourseFullException, DuplicateEnrollmentException).',
        'Maps domain entities to client-safe DTOs to hide internal database schema details.',
      ],
      lang: 'java',
      type: 'business',
      snippet: `@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

  private final CourseRepository courseRepository;
  private final EnrollmentRepository enrollmentRepository;

  @Override
  @Transactional
  public EnrollmentDto enrollStudent(String studentEmail, Long courseId) {
    Course course = courseRepository.findById(courseId)
        .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));

    if (enrollmentRepository.existsByStudentEmailAndCourseId(studentEmail, courseId)) {
      throw new ConflictException("Student is already enrolled in this course");
    }

    if (course.getEnrolledCount() >= course.getCapacity()) {
      throw new CourseFullException("Course " + course.getTitle() + " has reached maximum capacity");
    }

    course.incrementEnrolled();
    Enrollment enrollment = enrollmentRepository.save(new Enrollment(studentEmail, course));
    return EnrollmentMapper.toDto(enrollment);
  }
}`,
    },
    {
      id: 'repository',
      name: 'Persistence / Repository Layer',
      tech: 'Spring Data JPA · Hibernate ORM · JPQL',
      role: 'Abstracts database access behind typed interfaces and generates optimized SQL queries.',
      responsibilities: [
        'Extends JpaRepository to inherit standard CRUD operations and pagination out of the box.',
        'Defines custom queries using derived method naming and explicit JPQL/SQL.',
        'Employs pessimistic/optimistic locking where concurrency control is vital.',
        'Prevents N+1 query problems using fetch joins and EntityGraphs.',
      ],
      lang: 'java',
      type: 'persistence',
      snippet: `public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

  boolean existsByStudentEmailAndCourseId(String studentEmail, Long courseId);

  @Query("SELECT e FROM Enrollment e JOIN FETCH e.course WHERE e.studentEmail = :email")
  List<Enrollment> findAllByStudentEmailWithCourse(@Param("email") String email);

  @Query("SELECT COUNT(e) FROM Enrollment e WHERE e.course.id = :courseId")
  long countByCourseId(@Param("courseId") Long courseId);
}`,
    },
    {
      id: 'database',
      name: 'MySQL Relational Database',
      tech: 'MySQL 8.0 · InnoDB Engine · Normalized Schema',
      role: 'Stores persistent application state with ACID guarantees, foreign keys, and indexes.',
      responsibilities: [
        'Normalized 3NF schema prevents redundant data anomalies across students, courses, and enrollments.',
        'Foreign key constraints maintain referential integrity.',
        'Composite unique constraint (student_email, course_id) prevents race-condition duplicate enrollments.',
        'B-tree indexes on foreign keys and lookup columns optimize query execution time by 30%.',
      ],
      lang: 'sql',
      type: 'database',
      snippet: `CREATE TABLE courses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(120) NOT NULL,
  capacity INT NOT NULL,
  enrolled_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE enrollments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_email VARCHAR(180) NOT NULL,
  course_id BIGINT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE RESTRICT,
  CONSTRAINT uq_student_course UNIQUE (student_email, course_id)
) ENGINE=InnoDB;

CREATE INDEX idx_enrollments_email ON enrollments(student_email);`,
    },
  ],
  crossCutting: [
    {
      id: 'authn',
      title: 'Authentication (Stateless JWT)',
      concept: 'Identity is verified via credentials at login; subsequent requests prove identity through a tamper-proof signed JSON Web Token.',
      implementation: 'OncePerRequestFilter checks Authorization header, verifies signature with server secret, and injects principal into SecurityContext.',
      benefit: 'Stateless servers require no in-memory session synchronization, scaling easily across multiple instances.',
      lang: 'java',
      codeSnippet: `String token = Jwts.builder()
    .subject(user.getEmail())
    .claim("role", user.getRole().name())
    .issuedAt(new Date())
    .expiration(new Date(System.currentTimeMillis() + 86400000))
    .signWith(signingKey, Jwts.SIG.HS256)
    .compact();`,
    },
    {
      id: 'authz',
      title: 'Authorization (Role-Based Access Control)',
      concept: 'Access rights are bound to roles (ROLE_ADMIN, ROLE_STUDENT). Endpoints guard resources based on user authorities.',
      implementation: 'Method security enabled via @EnableMethodSecurity and declared declaratively with @PreAuthorize annotations on controller handlers.',
      benefit: 'Eliminates ad-hoc security code; unpermitted callers receive HTTP 403 Forbidden before method execution.',
      lang: 'java',
      codeSnippet: `@PreAuthorize("hasRole('ADMIN')")
@DeleteMapping("/api/courses/{id}")
public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
  courseService.deleteCourse(id);
  return ResponseEntity.noContent().build();
}`,
    },
    {
      id: 'validation',
      title: 'Request Validation (Bean Validation)',
      concept: 'Payload constraints are validated at the perimeter before any business logic or persistence code is invoked.',
      implementation: 'Hibernate Validator evaluates annotations like @NotBlank, @Size, @Min, @Email. Violations throw MethodArgumentNotValidException.',
      benefit: 'Guarantees corrupted or malicious data never reaches business services; returns standardized 400 Bad Request.',
      lang: 'java',
      codeSnippet: `public record CreateCourseRequest(
  @NotBlank(message = "Title is required")
  @Size(min = 3, max = 100, message = "Title must be between 3 and 100 chars")
  String title,

  @NotNull(message = "Capacity is required")
  @Min(value = 1, message = "Capacity must be at least 1")
  @Max(value = 500, message = "Capacity cannot exceed 500")
  Integer capacity
) {}`,
    },
    {
      id: 'exceptions',
      title: 'Centralized Exception Handling',
      concept: 'Any runtime exception thrown across controllers, services, or repositories is caught by a single global advice handler.',
      implementation: '@RestControllerAdvice catches domain exceptions and returns a consistent RFC-7807 style error payload with matching HTTP status codes.',
      benefit: 'Prevents internal stack traces from leaking to clients while ensuring frontend receives predictable error contracts.',
      lang: 'java',
      codeSnippet: `@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
        new ErrorResponse(HttpStatus.NOT_FOUND.value(), "Not Found", ex.getMessage(), req.getRequestURI()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex, HttpServletRequest req) {
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
        new ErrorResponse(HttpStatus.FORBIDDEN.value(), "Forbidden", "Access Denied", req.getRequestURI()));
  }
}`,
    },
    {
      id: 'persistence',
      title: 'Database Persistence & ACID Transactions',
      concept: 'All relational state modifications run within ACID transaction scopes backed by foreign keys and unique constraints.',
      implementation: '@Transactional on service methods ensures rollback on unchecked exceptions, while MySQL InnoDB enforces referential integrity.',
      benefit: 'Guarantees zero orphan records or partial updates even under concurrent user enrollments.',
      lang: 'java',
      codeSnippet: `@Transactional(rollbackFor = Exception.class)
public void cancelEnrollment(String email, Long courseId) {
  Enrollment e = enrollmentRepository.findByStudentEmailAndCourseId(email, courseId)
      .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
  enrollmentRepository.delete(e);
  courseRepository.decrementEnrolledCount(courseId);
}`,
    },
  ],
}

export const hospitalPatientFlowSystem: ArchitectureSystem = {
  id: 'patient-flow',
  title: 'AI-Based Patient Flow Prediction & Hospital Management',
  subtitle: 'Time-Series Machine Learning & REST Integration Architecture',
  badge: 'Predictive Analytics & Resource Optimization',
  summary:
    'An intelligent healthcare analytics system combining Python-based machine learning pipelines with normalized relational storage and REST endpoints. An LSTM neural network processes historical patient admissions to forecast future inflow with 90% accuracy, enabling proactive bed, ward, and staffing allocations.',
  layers: [
    {
      id: 'stream',
      name: 'Hospital Data Ingestion & EHR Stream',
      tech: 'Hospital Information Systems (HIS) · CSV/JSON Ingestion · REST Webhooks',
      role: 'Captures raw patient admission records, timestamps, triage severity scores, and department transfers.',
      responsibilities: [
        'Collects historical and streaming admission events from emergency and outpatient wards.',
        'Anonymizes patient identifiers to ensure healthcare privacy compliance.',
        'Feeds continuous chronological admission series into the analytics ingestion pipeline.',
      ],
      lang: 'json',
      type: 'frontend',
      snippet: `// Raw Admission Event Stream
{
  "event_id": "ADM-2026-9812",
  "timestamp": "2026-11-04T18:30:00Z",
  "ward_id": "EMERGENCY_DEPT",
  "triage_level": 2,
  "age_group": "45-64",
  "chief_complaint": "Respiratory distress",
  "admitted": true
}`,
    },
    {
      id: 'eda-pipeline',
      name: 'Data Preprocessing & EDA Pipeline',
      tech: 'Python · Pandas · NumPy · SciPy',
      role: 'Cleans noisy sensor and admission streams, imputes missing timestamps, and analyzes time-series distributions.',
      responsibilities: [
        'Performs Exploratory Data Analysis (EDA) on 10,000+ admission records to uncover hourly patterns.',
        'Detects and handles anomalies and sensor dropouts using interquartile range (IQR) filtering.',
        'Improves model accuracy by +15% through rigorous outlier treatment and distribution alignment.',
      ],
      lang: 'py',
      type: 'ml',
      snippet: `import pandas as pd
import numpy as np

def preprocess_admission_stream(df: pd.DataFrame) -> pd.DataFrame:
    # Ensure sequential timestamps
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('timestamp').set_index('timestamp')
    
    # Resample to hourly admission counts
    hourly = df['admitted'].resample('1H').sum().fillna(0)
    
    # Cap statistical outliers beyond 3 standard deviations
    mean, std = hourly.mean(), hourly.std()
    hourly_clean = hourly.clip(lower=0, upper=mean + 3 * std)
    return hourly_clean.to_frame(name='admission_count')`,
    },
    {
      id: 'feature-engineering',
      name: 'Feature Engineering & Lag Windowing',
      tech: 'Feature Engineering · Rolling Windows · MinMax Scaler',
      role: 'Extracts temporal features (hour, day of week, cyclical sine/cosine, lag windows) for time-series modeling.',
      responsibilities: [
        'Constructs sliding sequence windows (e.g. past 24 hours to predict next 6-12 hours).',
        'Extracts cyclical features (hour of day, weekend indicator, shift cycles).',
        'Applies MinMaxScaler normalization to ensure stable neural network gradient descent.',
      ],
      lang: 'py',
      type: 'ml',
      snippet: `def create_time_series_features(data: pd.DataFrame, window_size: int = 24):
    df = data.copy()
    # Cyclical temporal features
    df['hour_sin'] = np.sin(2 * np.pi * df.index.hour / 24.0)
    df['hour_cos'] = np.cos(2 * np.pi * df.index.hour / 24.0)
    df['day_of_week'] = df.index.dayofweek
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    # Autoregressive lag windows
    for lag in range(1, window_size + 1):
        df[f'lag_{lag}'] = df['admission_count'].shift(lag)
        
    return df.dropna()`,
    },
    {
      id: 'lstm-model',
      name: 'LSTM Time-Series Neural Network',
      tech: 'TensorFlow / Keras · Bi-directional LSTM · Adam Optimizer',
      role: 'Captures long-term sequential dependencies in patient arrivals and forecasts future patient inflow with 90% accuracy.',
      responsibilities: [
        'Processes 24-step sequence memory to learn non-linear patient inflow dynamics.',
        'Employs Dropout (0.2) to prevent overfitting on seasonal hospital spikes.',
        'Outputs probabilistic hourly inflow forecast for the subsequent 12–24 hour planning window.',
      ],
      lang: 'py',
      type: 'ml',
      snippet: `from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout

def build_lstm_inflow_model(input_shape=(24, 5)):
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=input_shape),
        Dropout(0.2),
        LSTM(32, return_sequences=False),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1, activation='linear') # Forecasts patient arrivals
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model`,
    },
    {
      id: 'model-api',
      name: 'Inference & REST Serving API',
      tech: 'FastAPI / REST APIs · Pydantic · Uvicorn',
      role: 'Exposes forecasted inflow predictions, department capacities, and bed-occupancy alerts to hospital administrators.',
      responsibilities: [
        'Serves low-latency REST endpoints for real-time forecast retrieval.',
        'Implements request validation on department queries and date ranges.',
        'Calculates real-time threshold warnings (e.g. capacity > 85% flags red alert).',
        'Connects seamlessly to automated workflow triggers for doctor and nurse on-call scheduling.',
      ],
      lang: 'py',
      type: 'api',
      snippet: `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Hospital Patient Flow Analytics API")

@app.get("/api/analytics/patient-flow/forecast")
def get_forecast(department_id: str = "EMERGENCY", hours: int = 12):
    forecast = predictor.predict_inflow(department_id, horizon=hours)
    capacity = db.get_ward_capacity(department_id)
    alert = forecast.predicted_peak > (capacity.total_beds * 0.85)
    
    return {
        "department": department_id,
        "forecast_hours": hours,
        "predicted_arrivals": forecast.values,
        "current_occupancy_pct": capacity.current_occupancy_pct,
        "capacity_alert": alert,
        "recommended_nurses_on_shift": calculate_staffing(forecast.predicted_peak)
    }`,
    },
    {
      id: 'hospital-db',
      name: 'MySQL Healthcare Management Schema',
      tech: 'MySQL 8.0 · InnoDB · Indexed Department Metrics',
      role: 'Durable relational storage for ward capacities, staff shifts, historical accuracy logs, and forecasted demands.',
      responsibilities: [
        'Normalized tables store department metadata, bed availability, and staffing logs.',
        'Optimized indexes reduce query execution time by 30% during emergency lookups.',
        'Stores historical model prediction vs actual arrivals to support continuous model evaluation.',
      ],
      lang: 'sql',
      type: 'database',
      snippet: `CREATE TABLE hospital_wards (
  ward_id VARCHAR(32) PRIMARY KEY,
  ward_name VARCHAR(100) NOT NULL,
  total_beds INT NOT NULL,
  available_beds INT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE patient_flow_forecasts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ward_id VARCHAR(32) NOT NULL,
  forecast_time DATETIME NOT NULL,
  predicted_inflow INT NOT NULL,
  actual_inflow INT DEFAULT NULL,
  accuracy_rate DECIMAL(5,2) DEFAULT NULL,
  FOREIGN KEY (ward_id) REFERENCES hospital_wards(ward_id),
  INDEX idx_ward_time (ward_id, forecast_time)
) ENGINE=InnoDB;`,
    },
  ],
  crossCutting: [
    {
      id: 'forecasting-accuracy',
      title: 'Time-Series Model Optimization',
      concept: 'Predicting healthcare arrivals requires capturing trend, day-of-week seasonality, and surge behaviors.',
      implementation: 'LSTM recurrent neural network trained on normalized sequential hourly admission windows with hyperparameter tuning.',
      benefit: 'Achieved 90% inflow prediction accuracy, providing clinical leads with 12 hours of advance warning before bed bottlenecks.',
      lang: 'py',
      codeSnippet: `# Validation on unseen test set
loss, mae = model.evaluate(X_test, y_test)
accuracy_pct = max(0, 100 - (mae / y_test.mean()) * 100)
print(f"Validated Model Accuracy: {accuracy_pct:.1f}%")`,
    },
    {
      id: 'resource-allocation',
      title: 'Automated Resource Allocation',
      concept: 'Bridging data science with hospital operations by turning numerical forecasts into staff and bed scheduling decisions.',
      implementation: 'Rule-based decision engine integrated with REST APIs maps forecasted arrivals to nurse-to-patient ratios.',
      benefit: 'Prevents ward overcrowding and reduces patient emergency wait times during peak hours.',
      lang: 'py',
      codeSnippet: `def recommend_allocation(predicted_arrivals: int, bed_capacity: int):
    required_nurses = max(2, int(np.ceil(predicted_arrivals / 4.0)))
    emergency_divert = predicted_arrivals > bed_capacity
    return {
        "allocated_nurses": required_nurses,
        "recommend_bed_surge": emergency_divert
    }`,
    },
    {
      id: 'query-optimization',
      title: 'MySQL Query Optimization (30% Faster)',
      concept: 'High-frequency bed availability and forecast joins must execute sub-second during emergency admission triage.',
      implementation: 'Normalized schema with targeted composite indexes (ward_id, forecast_time) and query execution plan tuning.',
      benefit: 'Achieved 30% faster query execution time under heavy hospital dashboard polling.',
      lang: 'sql',
      codeSnippet: `EXPLAIN SELECT w.ward_name, w.available_beds, f.predicted_inflow
FROM hospital_wards w
JOIN patient_flow_forecasts f ON w.ward_id = f.ward_id
WHERE f.forecast_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 12 HOUR)
ORDER BY f.forecast_time ASC;`,
    },
  ],
}

// Backwards compatibility aliases
export type Layer = ArchitectureLayer
export const layers: Layer[] = courseEnrollmentSystem.layers
export const exceptionHandler = {
  name: 'Global exception handler',
  tech: '@RestControllerAdvice',
  description:
    'Any exception thrown in the controller, service or repository is caught here and converted into one consistent JSON error body with the right status code.',
}
