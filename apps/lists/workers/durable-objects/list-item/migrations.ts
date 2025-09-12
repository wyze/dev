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
  '2025_09_10_00_add_attribute_table': {
    async up(db) {
      await db.schema
        .createTable('attribute')
        .ifNotExists()
        .addColumn('list_item_id', 'varchar(36)', (column) =>
          column.notNull().references('list_item.id').onDelete('cascade'),
        )
        .addColumn('attribute', 'varchar(100)', (column) => column.notNull())
        .addColumn('value', 'text', (column) => column.notNull())
        .addPrimaryKeyConstraint('attribute_pkey', [
          'list_item_id',
          'attribute',
        ])
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
