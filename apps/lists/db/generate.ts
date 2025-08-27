import Database from 'better-sqlite3'
import { SqliteDialect } from 'kysely'

import { createAuth } from '../app/.server/auth'

export const auth: ReturnType<typeof createAuth> = createAuth(
  new SqliteDialect({
    database: new Database(process.env.LOCAL_DB_PATH),
  }),
)
