import { APIError } from 'better-auth/api'
import * as v from 'valibot'

export const ErrorSchema = v.union([
  v.pipe(
    v.instance(APIError),
    v.transform((value) => value.body?.message ?? value.message),
  ),
  v.pipe(
    v.instance(Error),
    v.transform((value) => value.message),
  ),
  v.pipe(
    v.unknown(),
    v.transform(() => 'An unknown error occurred'),
  ),
])

export const PasswordSchema = v.pipe(
  v.string('Must be a string.'),
  v.minLength(8, 'Must be at least 8 characters long.'),
  v.maxLength(128, 'Cannot be more than 128 characters long.'),
)

export const FormSchema = v.variant('intent', [
  v.object({
    intent: v.literal('email'),
    email: v.pipe(
      v.string('Must be a string.'),
      v.email('Must be an email address.'),
    ),
    password: PasswordSchema,
  }),
  v.object({
    intent: v.literal('social'),
    provider: v.picklist(['github', 'google']),
  }),
])
