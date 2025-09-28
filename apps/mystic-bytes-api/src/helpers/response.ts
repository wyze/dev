import { type Type, type } from 'arktype'
import { type describeRoute, resolver } from 'hono-openapi'

import { env } from 'cloudflare:workers'

type ResponseDescription = NonNullable<
  Parameters<typeof describeRoute>[0]['responses']
>[string]

const TextContent = {
  'text/plain': {
    schema: resolver(type('string')),
  },
} as const

export function badRequest<const def>(schema: Type<def>) {
  return {
    400: {
      description: 'Bad Request',
      content: {
        'application/json': {
          schema: resolver(schema),
        },
      },
    },
  } as const
}

export function forbidden() {
  return {
    403: {
      description: 'Forbidden',
      content: TextContent,
    },
  } as const
}

export function ok<const def>(schema: Type<def>) {
  return {
    200: {
      description: 'Default response',
      content: {
        'application/json': {
          schema: resolver(schema),
        },
      },
    },
  } as const
}

export function serverError(): Record<500, ResponseDescription> {
  if (env.ENV === 'development') {
    return {
      500: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: resolver(type({ message: 'string', stack: 'string' })),
          },
        },
      },
    } as const
  }

  return {
    500: {
      description: 'Internal Server Error',
      content: TextContent,
    },
  } as const
}

export function unauthorized() {
  return {
    401: {
      description: 'Unauthorized',
      content: TextContent,
    },
  } as const
}
