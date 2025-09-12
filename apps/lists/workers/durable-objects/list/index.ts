import type { Generated, Insertable, Updateable } from 'kysely'
import type { Params } from 'react-router'

import type { Uuid } from '~/helpers/create-uuid'

import { provider } from './migrations'
import { Base, type Env } from '../base'

type ListType = 'basic' | 'shopping' | 'todo'

interface Data {
  id: Uuid
  name: string
  slug: Generated<string>
  type: ListType
  deleted_at: Date | null
  updated_at: Generated<Date>
}

export class List extends Base<{ list: Data }> {
  env: Env
  storage: DurableObjectStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env, provider)

    this.env = env
    this.storage = ctx.storage
  }

  private slugify<T extends { name?: string }>(list: T) {
    if (!('name' in list) || !list.name) {
      return list
    }

    const slug = list.name
      .toLowerCase()
      .replaceAll(/\s+/g, '-')
      .replaceAll(/-+/g, '-')
      .replaceAll(/[^\da-z-]+/g, '')

    return { ...list, slug }
  }

  private addShortId<T extends { id: Uuid }>(item: T | undefined) {
    return item ? { ...item, shortId: item.id.slice(-8) } : item
  }

  async create(list: Insertable<Data>) {
    return this.db
      .insertInto('list')
      .values(this.slugify(list))
      .returning(['id', 'slug'])
      .executeTakeFirst()
      .then(this.addShortId)
  }

  async delete(id: Data['id']) {
    return this.update({ id, deleted_at: new Date() })
  }

  async fromParams(params: Params<'id'>) {
    return this.db
      .selectFrom('list')
      .selectAll()
      .where('id', 'like', `%${params.id}` as Uuid)
      .executeTakeFirst()
      .then(this.addShortId)
  }

  async get() {
    return this.db
      .selectFrom('list')
      .selectAll()
      .execute()
      .then((lists) =>
        Promise.all(
          lists.map(async (list) => {
            const entries = await this.env.LIST_ITEMS.getByName(list.id).count
            const withShortId = this.addShortId(list)

            return { ...withShortId, ...list, entries }
          }),
        ),
      )
  }

  async update(list: Updateable<Data> & { id: Data['id'] }) {
    if (typeof list.type === 'string') {
      await this.d1
        .updateTable('list_metadata')
        .set({ type: list.type, updated_at: new Date() })
        .where('list_id', '=', list.id)
        .execute()
    }

    return this.db
      .updateTable('list')
      .set(this.slugify(list))
      .where('id', '=', list.id)
      .returning(['id', 'slug'])
      .executeTakeFirst()
  }

  async destroy() {
    await this.db.deleteFrom('list').execute()
    await this.storage.deleteAll()
  }
}
