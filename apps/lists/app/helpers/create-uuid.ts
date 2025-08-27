import { v7 as uuidv7 } from 'uuid'
import * as v from 'valibot'

export const UuidSchema = v.pipe(
  v.string('Must be a string.'),
  v.uuid('Must be a uuid.'),
  v.brand('Uuid'),
)

export type Uuid = v.InferOutput<typeof UuidSchema>

export function createUuid() {
  return v.parse(UuidSchema, uuidv7())
}
