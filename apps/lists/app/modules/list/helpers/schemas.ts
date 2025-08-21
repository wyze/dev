import * as v from 'valibot'

const UuidSchema = v.pipe(
  v.string('Must be a string.'),
  v.uuid('Must be a uuid.'),
  v.brand('Uuid'),
)

export type Uuid = v.InferOutput<typeof UuidSchema>

export const ListSchema = v.object({
  entries: v.pipe(
    v.array(
      v.object({
        id: UuidSchema,
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
})

export const ListsSchema = v.pipe(
  v.array(ListSchema),
  v.minLength(1, 'Must have at least 1 list.'),
)

export const NullableListsSchema = v.nullable(ListsSchema)
