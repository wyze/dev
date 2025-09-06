import Database from 'better-sqlite3'
import { SqliteDialect } from 'kysely'

import { createAuth } from '../app/.server/auth'
import { getEnv } from '../app/.server/env'

export const auth: ReturnType<typeof createAuth> = createAuth(
  getEnv({ cloudflare: { env: process.env } }),
  new SqliteDialect({
    database: new Database(process.env.LOCAL_DB_PATH),
  }),
)
