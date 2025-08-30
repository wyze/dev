import type { Migration, MigrationProvider } from 'kysely'
import { sql } from 'kysely'

const migrations: Record<string, Migration> = {
  '2025_08_28_00_add_list_item_table': {
    async up(db) {
      await db.schema
        .createTable('list_item')
        .ifNotExists()
        .addColumn('id', 'varchar(36)', (column) =>
          column.notNull().primaryKey(),
        )
        .addColumn('content', 'text', (column) => column.notNull())
        .addColumn('completed_at', 'datetime')
        .addColumn('order', 'integer', (column) => column.notNull())
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
