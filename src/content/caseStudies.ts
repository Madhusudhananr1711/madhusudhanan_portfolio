// Outcome figures come from the resume. The challenge / approach / trade-off text
// describes the engineering approach behind each project in general terms.
// TODO (owner): replace or extend with the specific bugs and decisions you personally hit.

export interface CaseStudy {
  id: string
  title: string
  project: string
  challenge: string
  approach: string[]
  tradeoffs: string[]
  outcome: string[]
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'secure-api',
    title: 'Securing 50+ endpoints consistently',
    project: 'Course Enrollment and Management System',
    challenge:
      'With dozens of endpoints, security checks written one at a time drift apart: one forgotten rule leaves a hole, and different handlers report errors differently.',
    approach: [
      'Authenticate once in a JWT filter so no controller ever sees an unauthenticated request.',
      'Express authorization as role rules (RBAC) rather than ad-hoc if-statements inside services.',
      'Validate DTOs at the controller edge and route every failure through a centralized exception handler.',
    ],
    tradeoffs: [
      'Stateless JWTs scale simply, but a token stays valid until it expires, so lifetimes should be short.',
      'Role-level checks are easy to reason about but coarser than per-resource ownership rules, which belong in the service layer.',
    ],
    outcome: [
      '50+ RESTful APIs secured with JWT and RBAC.',
      'Input validation and exception handling improved code quality and application reliability.',
    ],
  },
  {
    id: 'schema',
    title: 'Designing a schema that stays fast and consistent',
    project: 'Course Enrollment and Management System',
    challenge:
      'Enrollment data touches students, courses and the relationships between them. Duplicated or loosely constrained data leads to inconsistent records and slower queries.',
    approach: [
      'Normalize tables so each fact is stored once.',
      'Let the database enforce integrity with keys and unique constraints, not only application code.',
      'Map entities with JPA/Hibernate and keep queries in repositories.',
    ],
    tradeoffs: [
      'Normalization means more joins; it pays off in integrity and, with sensible keys and indexes, in query efficiency.',
      'ORM convenience can hide inefficient queries, so it is worth checking what Hibernate actually runs.',
    ],
    outcome: [
      'Normalized MySQL schemas improved data integrity and query efficiency by 30%.',
      'Enrollment efficiency increased by 25%.',
    ],
  },
  {
    id: 'forecast',
    title: 'Forecasting patient inflow with an LSTM',
    project: 'AI-Based Patient Flow Prediction and Hospital Resource Management',
    challenge:
      'Hospitals need to anticipate patient inflow to allocate resources, and raw time-series data rarely arrives ready for a model.',
    approach: [
      'Explore the data first (EDA) to understand its patterns before modelling.',
      'Engineer features that expose those patterns to the model.',
      'Train an LSTM time-series model and validate the results.',
      'Expose the data through MySQL and REST APIs so workflows can be automated.',
    ],
    tradeoffs: [
      'LSTMs capture sequence patterns well but are harder to interpret than simpler baselines.',
      'Accuracy on historical data must be validated, since good fit on the past does not guarantee future performance.',
    ],
    outcome: [
      'Patient inflow predicted with 90% accuracy.',
      'EDA and feature engineering increased prediction accuracy by 15%.',
      'Query execution time improved by 30% with MySQL and REST API integration.',
    ],
  },
  {
    id: 'analytics',
    title: 'Turning sales data into decisions',
    project: 'Supermarket Sales Analytics',
    challenge:
      'Ten thousand-plus rows of sales data are hard to act on in raw form, and manual reporting is slow.',
    approach: [
      'Query and shape the data with SQL and MySQL; use Excel for quick checks.',
      'Build interactive Power BI dashboards and SQL-based reports for trends and inventory insights.',
    ],
    tradeoffs: [
      'Interactive dashboards trade a one-off report for something that needs maintaining as the data changes.',
    ],
    outcome: [
      '10K+ rows analysed; 5 interactive Power BI dashboards built.',
      'Reporting time reduced by 20%.',
    ],
  },
]
