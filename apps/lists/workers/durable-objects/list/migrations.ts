import type { Migration, MigrationProvider } from 'kysely'
import { sql } from 'kysely'

const migrations: Record<string, Migration> = {
  '2025_08_28_00_add_list_table': {
    async up(db) {
      await db.schema
        .createTable('list')
        .ifNotExists()
        .addColumn('id', 'varchar(36)', (column) =>
          column.notNull().primaryKey(),
        )
        .addColumn('name', 'varchar(250)', (column) => column.notNull())
        .addColumn('slug', 'varchar(250)', (column) => column.notNull())
        .addColumn('description', 'text')
        .addColumn('type', 'varchar(50)', (column) =>
          column.notNull().defaultTo('basic'),
        )
        .addColumn('updated_at', 'datetime', (column) =>
          column.notNull().defaultTo(sql`CURRENT_TIMESTAMP`),
        )
        .execute()
    },
  },
}

class StaticMigrationProvider implements MigrationProvider {
  async getMigrations() {
    return migrations
  }
}

export const provider = new StaticMigrationProvider()
