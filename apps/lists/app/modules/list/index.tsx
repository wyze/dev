import { Link, redirect } from 'react-router'

import { auth } from '~/.server/auth'
import { pluralize } from '~/helpers/pluralize'

import type { Route } from './+types'

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await auth.api.getSession(request)

  if (!session) {
    throw redirect('/')
  }

  const lists = await context.cloudflare.env.LISTS.getByName(
    session.user.id,
  ).get()

  return { lists }
}

export default function ListIndex({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      {loaderData.lists.map((list) => (
        <Link key={list.id} to={`${list.shortId}/${list.slug}`}>
          {list.name} ({pluralize('entry', list.entries)})
        </Link>
      ))}
    </div>
  )
}
