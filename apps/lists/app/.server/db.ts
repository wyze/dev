import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import { SerializePlugin } from 'kysely-plugin-serialize'

import type { Uuid } from '~/helpers/create-uuid'

interface ListMetadata {
  list_id: Uuid
  user_id: Uuid
  items: number
  type: string
  created_at: Date
  updated_at: Date
}

interface Verification {
  id: Uuid
  identifier: string
  value: string
  expires_at: Date
  created_at: Date | null
  updated_at: Date | null
}

interface Database {
  list_metadata: ListMetadata
  verification: Verification
}

export let db: Kysely<Database>

export function createDatabase(dialect: Dialect) {
  if (!db) {
    db = new Kysely({
      dialect,
      log: import.meta.env.PROD ? ['error', 'query'] : undefined,
      plugins: [new SerializePlugin()],
    })
  }

  return db
}
