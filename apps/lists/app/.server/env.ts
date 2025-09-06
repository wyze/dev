import type { AppLoadContext } from 'react-router'
import * as v from 'valibot'

const EnvSchema = v.object({
  BETTER_AUTH_SECRET: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
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
  GITHUB_CLIENT_ID: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
  GITHUB_CLIENT_SECRET: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
  GOOGLE_CLIENT_ID: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
  GOOGLE_CLIENT_SECRET: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
})

export function getEnv(context: AppLoadContext) {
  return v.parse(EnvSchema, context.cloudflare.env)
}
