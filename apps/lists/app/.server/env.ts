import type { AppLoadContext } from 'react-router'
import * as v from 'valibot'

const EnvSchema = v.object({
  COOKIE_SECRET: v.pipe(
    v.string('Must be a string.'),
    v.transform((value) => value.split(',')),
    v.pipe(
      v.array(
        v.pipe(v.string(), v.minLength(32, 'Must be at least 32 characters.')),
      ),
      v.minLength(1, 'Must have at least 1 secret.'),
    ),
  ),
})

export function getEnv(context: AppLoadContext) {
  return v.parse(EnvSchema, context.cloudflare.env)
}
