import { type CookieSerializeOptions, createCookie } from 'react-router'
import * as v from 'valibot'

import type { HelperArgs } from '~/types'

import { getEnv } from './env'

export function create<TInput, TOutput>(
  { context, request }: HelperArgs,
  name: string,
  schema: v.GenericSchema<TInput, TOutput>,
) {
  const cookie = createCookie(name, {
    httpOnly: true,
    maxAge: 604_800, // One week
    sameSite: 'lax',
    secrets: getEnv(context).COOKIE_SECRET,
    secure: import.meta.env.PROD,
  })

  return {
    async get() {
      return v.parse(schema, await cookie.parse(request.headers.get('cookie')))
    },
    async save(value: TInput, options?: CookieSerializeOptions) {
      return new Headers({
        'set-cookie': await cookie.serialize(value, options),
      })
    },
  }
}
