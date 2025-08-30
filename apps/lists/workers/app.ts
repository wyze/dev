import { D1Dialect } from 'kysely-d1'
import { createRequestHandler } from 'react-router'

import { auth, createAuth } from '~/.server/auth'
import { createDatabase, db } from '~/.server/db'

import type { List } from './durable-objects/list'
import type { ListItem } from './durable-objects/list-item'

export interface Env extends Omit<Cloudflare.Env, 'LISTS' | 'LIST_ITEMS'> {
  LISTS: DurableObjectNamespace<List>
  LIST_ITEMS: DurableObjectNamespace<ListItem>
}

declare module 'react-router' {
  export interface AppLoadContext {
    cloudflare: {
      env: Env
      ctx: ExecutionContext
    }
    db: typeof db
  }
}

const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)

export * from './durable-objects/list'
export * from './durable-objects/list-item'

export default {
  async fetch(request, env, ctx) {
    const dialect = new D1Dialect({ database: env.DB })

    if (!auth) {
      createAuth(dialect)
    }

    if (!db) {
      createDatabase(dialect)
    }

    return requestHandler(request, {
      cloudflare: { env, ctx },
      db,
    })
  },
} satisfies ExportedHandler<Env>
