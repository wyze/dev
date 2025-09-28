import { type } from 'arktype'
import { APIError } from 'better-auth/api'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { D1Dialect } from 'kysely-d1'

import { factory } from '@/helpers/factory'
import { createAuth } from '.'

type AuthVariables = {
  auth: ReturnType<typeof createAuth>
}

type Session = AuthVariables['auth']['$Infer']['Session']

type SessionVariables = {
  [Key in keyof Session]: Session[Key]
}

declare module 'hono' {
  interface ContextVariableMap extends AuthVariables, SessionVariables {}
}

const AuthApiError = type.instanceOf(APIError).to({
  message: 'string',
  statusCode: type(
    'number | string.integer.parse |> number > 399',
  ).as<ContentfulStatusCode>(),
})

export function auth() {
  return factory.createMiddleware(async (c, next) => {
    c.set('auth', createAuth(new D1Dialect({ database: c.env.DB })))

    return next()
  })
}

export function session(options: { public: string[] }) {
  return factory.createMiddleware(async (c, next) => {
    if (options.public.includes(c.req.path)) {
      return next()
    }

    const auth = c.get('auth')

    try {
      const session = await auth.api.getSession({ headers: c.req.raw.headers })

      if (!session) {
        return c.text('Unauthorized', 401)
      }

      c.set('user', session.user)
      c.set('session', session.session)

      return next()
    } catch (error) {
      const apiError = AuthApiError(error)

      if (apiError instanceof type.errors) {
        return c.text(apiError.summary, 500)
      }

      return c.text(apiError.message, apiError.statusCode)
    }
  })
}
