import type { Generated, Insertable, Updateable } from 'kysely'

import type { Uuid } from '~/helpers/create-uuid'

import { provider } from './migrations'
import { Base, type Env } from '../base'

interface Data {
  id: Uuid
  content: string
  completed_at: Date | null
  order: Generated<number>
  updated_at: Generated<Date>
}

export class ListItem extends Base<{ list_item: Data }> {
  #count: number = 0

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env, provider)

    this.ctx.blockConcurrencyWhile(async () => {
      this.#count =
        (await ctx.storage.get<number>('count')) ??
        (await this.db
          .selectFrom('list_item')
          .select((eb) => [eb.fn.countAll<number>().as('total')])
          .executeTakeFirstOrThrow()
          .then((data) => data.total))
    })
  }

  get count() {
    return this.#count
  }

  async create(listId: Uuid, item: Insertable<Data>) {
    // Always add to the bottom of the list
    this.#count += 1

    await Promise.all([
      this.ctx.storage.put('count', this.count),
      this.d1
        .updateTable('list_metadata')
        .set({ items: this.count, updated_at: new Date() })
        .where('list_id', '=', listId)
        .execute(),
    ])

    return this.db
      .insertInto('list_item')
      .values({ ...item, order: this.count })
      .returning(['id'])
      .executeTakeFirst()
  }

  async delete(listId: Uuid, id: Uuid) {
    this.#count -= 1

    await Promise.all([
      this.db.deleteFrom('list_item').where('id', '=', id).execute(),
      this.ctx.storage.put('count', this.count),
      this.d1
        .updateTable('list_metadata')
        .set({ items: this.count, updated_at: new Date() })
        .where('list_id', '=', listId)
        .execute(),
    ])
  }

  async get() {
    return this.db
      .selectFrom('list_item')
      .selectAll()
      .orderBy('order')
      .execute()
  }

  async update(item: Updateable<Data> & { id: Data['id'] }) {
    return this.db
      .updateTable('list_item')
      .set(item)
      .where('id', '=', item.id)
      .returning(['id'])
      .executeTakeFirst()
  }
}
