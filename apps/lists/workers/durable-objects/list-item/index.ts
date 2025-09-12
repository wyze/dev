import type { Generated, Insertable, Updateable } from 'kysely'
import { jsonArrayFrom } from 'kysely/helpers/sqlite'
import * as v from 'valibot'

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

interface BaseAttribute {
  list_item_id: Uuid
  attribute: unknown
  value: unknown
}

interface Category extends BaseAttribute {
  attribute: 'category'
  value: string
}

interface Price extends BaseAttribute {
  attribute: 'price'
  value: number
}

interface Quantity extends BaseAttribute {
  attribute: 'quantity'
  value: number
}

type Attribute = Category | Price | Quantity

type AttributeMap = {
  [T in Attribute['attribute']]: Extract<Attribute, { attribute: T }>['value']
}

const AttributeSchema = v.pipe(
  v.array(
    v.object({
      attribute: v.string(),
      value: v.string(),
    }),
  ),
  v.transform((value) => {
    if (value.length === 0) {
      return null
    }

    return value.reduce(
      (acc, { attribute, value }) => {
        switch (attribute) {
          case 'category':
            acc.category = value

            break
          case 'price':
            acc.price = Number(value)

            break
          case 'quantity':
            acc.quantity = Number(value)

            break
        }

        return acc
      },
      {} as Partial<AttributeMap>,
    )
  }),
)

function intersect<T extends Record<string, unknown>, Key extends keyof T>(
  left: T[],
  right: T[],
  key: Key,
  options?: { inverse: boolean },
) {
  return left.filter((lefty) => {
    const found = right.find((righty) => lefty[key] === righty[key])

    return options?.inverse ? !found : found
  })
}

export class ListItem extends Base<{ attribute: Attribute; list_item: Data }> {
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
      .selectAll('list_item')
      .select((eb) => [
        jsonArrayFrom(
          eb
            .selectFrom('attribute')
            .select(['attribute', 'value'])
            .whereRef('list_item_id', '=', 'id'),
        ).as('attributes'),
      ])
      .orderBy('order')
      .execute()
      .then((data) =>
        data.map(({ attributes, ...item }) => ({
          ...item,
          attributes: v.parse(AttributeSchema, attributes),
        })),
      )
  }

  async update(item: Updateable<Data> & { id: Data['id'] }) {
    return this.db
      .updateTable('list_item')
      .set(item)
      .where('id', '=', item.id)
      .returning(['id'])
      .executeTakeFirst()
  }

  async attributes(
    id: Data['id'],
    incoming: Array<Omit<Attribute, 'list_item_id'>>,
  ) {
    const existing = await this.db
      .selectFrom('attribute')
      .select(['attribute', 'value'])
      .where('list_item_id', '=', id)
      .orderBy('attribute', 'asc')
      .execute()

    const deletes = intersect(existing, incoming, 'attribute', {
      inverse: true,
    })
    const inserts = intersect(incoming, existing, 'attribute', {
      inverse: true,
    })
    const updates = intersect(incoming, existing, 'attribute')

    if (deletes.length > 0) {
      await this.db
        .deleteFrom('attribute')
        .where('list_item_id', '=', id)
        .where(
          'attribute',
          'in',
          deletes.map((item) => item.attribute),
        )
        .execute()
    }

    if (inserts.length > 0) {
      await this.db
        .insertInto('attribute')
        .values(inserts.map((insert) => ({ list_item_id: id, ...insert })))
        .execute()
    }

    if (updates.length > 0) {
      await Promise.all(
        updates.map((update) =>
          this.db
            .updateTable('attribute')
            .set({ value: update.value })
            .where('list_item_id', '=', id)
            .where('attribute', '=', update.attribute)
            .execute(),
        ),
      )
    }
  }
}
