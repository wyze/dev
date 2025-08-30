import type { MigrationProvider } from 'kysely'
import { Kysely, Migrator } from 'kysely'
import { D1Dialect } from 'kysely-d1'
import { DurableObjectSqliteDialect } from 'kysely-durable-object-sqlite'

import { createDatabase } from '~/.server/db'

import { DurableObject } from 'cloudflare:workers'
import type { Env } from '../app'

export type { Env }

export class Base<T> extends DurableObject {
  protected d1: ReturnType<typeof createDatabase>
  protected db: Kysely<T>

  constructor(ctx: DurableObjectState, env: Env, provider: MigrationProvider) {
    super(ctx, env)

    this.d1 = createDatabase(new D1Dialect({ database: env.DB }))
    this.db = new Kysely({
      dialect: new DurableObjectSqliteDialect({
        sql: ctx.storage.sql,
      }),
    })

    this.ctx.blockConcurrencyWhile(async () => {
      const migrator = new Migrator({
        db: this.db,
        provider,
      })

      const { error, results } = await migrator.migrateToLatest()

      if (results) {
        for (const result of results) {
          if (result.status === 'Success') {
            console.log(
              `Migration "${result.migrationName}" was executed successfully.`,
            )
          } else if (result.status === 'Error') {
            console.error(
              `Failed to execute migration "${result.migrationName}".`,
            )
          }
        }
      }

      if (error) {
        console.error('Failed to migrate:')
        console.error(error)
        process.exit(1)
      }
    })
  }
}
