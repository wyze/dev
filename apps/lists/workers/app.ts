import { D1Dialect } from 'kysely-d1'
import { createRequestHandler } from 'react-router'

import { auth, createAuth } from '~/.server/auth'

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export default {
  async fetch(request, env, ctx) {
    if (!auth) {
      createAuth(new D1Dialect({ database: env.DB }))
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
    })
  },
} satisfies ExportedHandler<Env>
