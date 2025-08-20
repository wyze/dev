import { create } from '~/.server/cookie'
import type { HelperArgs } from '~/types'

import { ListsSchema, NullableListsSchema } from './schemas'

function getNullableCookie(args: HelperArgs) {
  return create(args, 'lists', NullableListsSchema)
}

function getStandardCookie(args: HelperArgs) {
  return create(args, 'lists', ListsSchema)
}

export function getListsCookie(
  args: HelperArgs,
  version: 'nullable',
): ReturnType<typeof getNullableCookie>
export function getListsCookie(
  args: HelperArgs,
  version: 'standard',
): ReturnType<typeof getStandardCookie>
export function getListsCookie(
  args: HelperArgs,
  version: 'nullable' | 'standard',
) {
  if (version === 'nullable') {
    return getNullableCookie(args)
  }

  return getStandardCookie(args)
}
