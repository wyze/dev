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

interface Database {
  list_metadata: ListMetadata
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
