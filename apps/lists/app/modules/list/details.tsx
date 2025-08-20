import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { data } from 'react-router'

import { pluralize } from '~/helpers/pluralize'

import type { Route } from './+types/details'
import { getListsCookie } from './helpers/get-lists-cookie'

export async function loader(args: Route.LoaderArgs) {
  const lists = await getListsCookie(args, 'standard').get()
  const list = lists.find((list) => list.id === args.params.id)

  if (!list) {
    throw data('List not found', { status: 404 })
  }

  return { list }
}

export default function ListDetails({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData

  return (
    <>
      <title>{`${list.name} :: Lists`}</title>
      <div className="mx-auto max-w-2xl p-12">
        <Card>
          <CardHeader className="space-y-1 border-b">
            <CardTitle>{list.name}</CardTitle>
            <CardDescription>
              {pluralize('item', list.entries.length)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {list.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <span className="flex-1">{entry.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
