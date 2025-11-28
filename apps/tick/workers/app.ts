import { createRequestHandler } from 'react-router'

import type { worker } from '../alchemy.run'

type Env = typeof worker.Env

declare module 'react-router' {
  // biome-ignore lint/style/useConsistentTypeDefinitions: Used to merge interface with react-router
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      cf: Request['cf']
      ctx: ExecutionContext
    }
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE
)

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return requestHandler(request, {
      cloudflare: { env, cf: request.cf, ctx },
    })
  },
}
