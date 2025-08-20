import { createCookieSessionStorage } from 'react-router'
import * as v from 'valibot'

import type { HelperArgs } from '~/types'

import { getEnv } from './env'

export function create<TInput, TOutput>(
  name: string,
  schema: v.GenericSchema<TInput, TOutput>,
) {
  return async function manage({ context, request }: HelperArgs) {
    const storage = createCookieSessionStorage({
      cookie: {
        name,
        httpOnly: true,
        maxAge: 604_800, // One week
        sameSite: 'lax',
        secrets: getEnv(context).COOKIE_SECRET,
        secure: import.meta.env.PROD,
      },
    })
    const session = await storage.getSession(request.headers.get('cookie'))

    return {
      async commit() {
        return {
          headers: {
            'set-cookie': await storage.commitSession(session),
          },
        }
      },
      delete() {
        return session.unset(name)
      },
      async destroy() {
        return {
          headers: {
            'set-cookie': await storage.destroySession(session),
          },
        }
      },
      exists() {
        return session.has(name)
      },
      flash(value: TInput) {
        return session.flash(name, value)
      },
      get() {
        const parsed = v.safeParse(schema, session.get(name))

        if (!parsed.success) {
          throw new Error(`Error parsing "${name}" session data`)
        }

        return parsed.output
      },
      session,
      set(value: TInput) {
        return session.set(name, value)
      },
    }
  }
}
