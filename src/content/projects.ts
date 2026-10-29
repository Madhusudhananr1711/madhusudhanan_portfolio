// Project facts are taken from the resume. `repoUrl` is intentionally left undefined
// until you add the real repository link — the UI then links to your GitHub profile instead.

export interface Project {
  id: string
  title: string
  kind: string
  summary: string
  stack: string[]
  highlights: { value: string; label: string }[]
  bullets: string[]
  repoUrl?: string
}

export const projects: Project[] = [
  {
    id: 'course-enrollment',
    title: 'Course Enrollment and Management System',
    kind: 'Full-stack · Spring Boot + React.js',
    summary:
      'A full-stack application engineered and architected independently, with a Spring Boot backend and a React.js frontend.',
    stack: ['Java', 'Spring Boot', 'Spring Security', 'JWT', 'JPA/Hibernate', 'MySQL', 'React.js'],
    highlights: [
      { value: '50+', label: 'secured API endpoints' },
      { value: '25%', label: 'system speed gain' },
    ],
    bullets: [
      'Engineered and architected a full-stack application independently, with a Spring Boot backend and React.js frontend, augmenting system speed by 25%.',
      'Implemented RBAC, JPA/Hibernate integration, input validation, and centralized exception handling to secure 50+ API endpoints for production-style deployment.',
    ],
    repoUrl: 'https://github.com/Madhusudhananr1711/Course-Enrollment-Management-System'
  },
  {
    id: 'patient-flow',
    title: 'AI-Based Patient Flow Prediction and Hospital Resource Management',
    kind: 'Machine learning · Time-series · REST + MySQL',
    summary:
      'An LSTM time-series forecasting model that predicts patient inflow to support hospital resource allocation.',
    stack: ['Python', 'LSTM', 'EDA', 'Feature engineering', 'MySQL', 'REST APIs'],
    highlights: [
      { value: '90%', label: 'inflow prediction accuracy' },
      { value: '+15%', label: 'accuracy from EDA & features' },
      { value: '30%', label: 'faster query execution' },
    ],
    bullets: [
      'Built an LSTM time-series forecasting model to predict patient inflow with 90% accuracy, supporting effective hospital resource allocation.',
      'Performed exploratory data analysis (EDA) and feature engineering, increasing model prediction accuracy by 15% and validating results.',
      'Integrated MySQL and REST APIs to support scalable automation of healthcare workflows, improving query execution time by 30%.',
    ],
    repoUrl: 'https://github.com/Madhusudhananr1711/AI-Patient-flow-prediction-and-Hospital-Management-System'
  },
  {
    id: 'supermarket-analytics',
    title: 'Supermarket Sales Analytics',
    kind: 'Data analytics · SQL + Power BI (internship work)',
    summary:
      'Sales analysis completed during the Data Analytics internship at Retech Solution Pvt Ltd.',
    stack: ['SQL', 'MySQL', 'Excel', 'Power BI'],
    highlights: [
      { value: '10K+', label: 'rows analysed' },
      { value: '5', label: 'interactive dashboards' },
      { value: '20%', label: 'less reporting time' },
    ],
    bullets: [
      'Analyzed 10K+ rows of supermarket sales data using SQL, MySQL, Excel, and Power BI to identify sales trends and optimize inventory insights.',
      'Constructed 5 interactive Power BI dashboards and SQL-based reports, supporting data-driven decision-making and reducing reporting time by 20%.',
    ],
    repoUrl: 'https://github.com/Madhusudhananr1711/Supermarket-Sales-Profit-Dashboard-Power-BI-'
  },
]
