import { create } from '~/.server/cookie'
import type { ServerArgs } from '~/types'

import { ListsSchema, NullableListsSchema } from './schemas'

function getNullableCookie(args: ServerArgs) {
  return create(args, 'lists', NullableListsSchema)
}

function getStandardCookie(args: ServerArgs) {
  return create(args, 'lists', ListsSchema)
}

export function getListsCookie(
  args: ServerArgs,
  version: 'nullable',
): ReturnType<typeof getNullableCookie>
export function getListsCookie(
  args: ServerArgs,
  version: 'standard',
): ReturnType<typeof getStandardCookie>
export function getListsCookie(
  args: ServerArgs,
  version: 'nullable' | 'standard',
) {
  if (version === 'nullable') {
    return getNullableCookie(args)
  }

  return getStandardCookie(args)
}
