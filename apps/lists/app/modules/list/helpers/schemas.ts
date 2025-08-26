import * as v from 'valibot'

import { UuidSchema } from '~/helpers/create-uuid'

export const ListSchema = v.object({
  entries: v.pipe(
    v.array(
      v.object({
        id: UuidSchema,
        completed_at: v.optional(v.nullable(v.string()), null),
        label: v.pipe(
          v.string('Must be a string.'),
          v.nonEmpty('Must provide a label for the entry.'),
        ),
      }),
    ),
    v.minLength(1, 'Must have at least one entry in the list.'),
  ),
  id: UuidSchema,
  name: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must provide a name for the list.'),
  ),
  type: v.optional(v.picklist(['basic', 'todo']), 'basic'),
})

export const ListsSchema = v.pipe(
  v.array(ListSchema),
  v.minLength(1, 'Must have at least 1 list.'),
)

export const NullableListsSchema = v.nullable(ListsSchema)
