import { Link } from 'react-router'

import { pluralize } from '~/helpers/pluralize'

import type { Route } from './+types'
import { getListsCookie } from './helpers/get-lists-cookie'

export async function loader(args: Route.LoaderArgs) {
  const lists = await getListsCookie(args, 'standard').get()

  return {
    lists: lists.map((list) => ({ ...list, entries: list.entries.length })),
  }
}

export default function ListIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      {loaderData.lists.map((list) => (
        <Link key={list.id} to={list.id}>
          {list.name} ({pluralize('entry', list.entries)})
        </Link>
      ))}
    </div>
  )
}
