import * as v from 'valibot'

export const ListSchema = v.object({
  entries: v.pipe(
    v.array(
      v.object({
        id: v.pipe(v.string('Must be a string.'), v.uuid('Must be a uuid.')),
        label: v.pipe(
          v.string('Must be a string.'),
          v.nonEmpty('Must provide a label for the entry.'),
        ),
      }),
    ),
    v.minLength(1, 'Must have at least one entry in the list.'),
  ),
  id: v.pipe(v.string('Must be a string.'), v.uuid('Must be a uuid.')),
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
