import { endpoints } from '../content/api.ts'

export function buildOpenApiSpec() {
  const paths: Record<string, Record<string, unknown>> = {}

  for (const e of endpoints) {
    const normalizedPath = e.path.replace(/\/\d+$/, '/{id}')
    paths[normalizedPath] ??= {}

    paths[normalizedPath][e.method.toLowerCase()] = {
      tags: [e.tag],
      summary: e.summary,
      description: e.description,
      operationId: e.id,
      ...(e.parameters
        ? {
            parameters: e.parameters.map((p) => ({
              name: p.name,
              in: p.in,
              required: p.required,
              description: p.description,
              schema: { type: p.type },
            })),
          }
        : {}),
      ...(e.access !== 'public'
        ? {
            security: [{ bearerAuth: [] }],
            'x-required-role': e.access,
          }
        : {}),
      ...(e.body
        ? {
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: e.bodySchema,
                  },
                  example: e.body,
                },
              },
            },
          }
        : {}),
      responses: Object.fromEntries(
        e.responses.map((r) => [
          String(r.status),
          {
            description: r.description,
            ...(r.example
              ? {
                  content: {
                    'application/json': {
                      example: r.example,
                    },
                  },
                }
              : {}),
          },
        ]),
      ),
    }
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Course Enrollment & Hospital Analytics REST API',
      version: '1.0.0',
      description:
        'Example OpenAPI 3.0.3 specification documenting RESTful endpoints for course enrollments and hospital patient-flow analytics.',
      contact: {
        name: 'Madhusudhanan R',
        email: 'rmadhusudhanan2003@gmail.com',
      },
    },
    servers: [
      {
        url: 'https://portfolio-api.demo',
        description: 'Simulated in-browser environment',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your simulated JWT Bearer token obtained from POST /api/auth/login',
        },
      },
    },
    paths,
  }
}
