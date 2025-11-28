import type { AppLoadContext } from 'react-router'
import * as v from 'valibot'

export function getTimezone(context: AppLoadContext) {
  const default_ = 'America/Chicago'

  return v.parse(
    v.optional(v.nullable(v.string(), default_), default_),
    context.cloudflare.cf?.timezone
  )
}
