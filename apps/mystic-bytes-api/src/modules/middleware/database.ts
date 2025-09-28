import { Kysely } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { SerializePlugin } from 'kysely-plugin-serialize'

import { factory } from '@/helpers/factory'

type DatabaseVariables = {
  db: Kysely<unknown>
}

declare module 'hono' {
  interface ContextVariableMap extends DatabaseVariables {}
}

export function database() {
  return factory.createMiddleware(async (c, next) => {
    c.set(
      'db',
      new Kysely<unknown>({
        dialect: new D1Dialect({ database: c.env.DB }),
        plugins: [new SerializePlugin()],
      }),
    )

    return next()
  })
}
