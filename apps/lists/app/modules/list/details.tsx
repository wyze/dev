import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { Input } from '@wyze/ui/input'
import * as React from 'react'
import { data, useSubmit } from 'react-router'
import * as v from 'valibot'

import { createToast } from '~/.server/toast'
import { combineHeaders } from '~/helpers/combine-headers'
import { pluralize } from '~/helpers/pluralize'
import { Icon } from '~/modules/icon'

import type { Route } from './+types/details'
import { getListsCookie } from './helpers/get-lists-cookie'

type State = {
  selected: 'title' | null
  text: string
}

type Action =
  | { type: 'done' }
  | { type: 'select'; data: State }
  | { type: 'type'; data: State['text'] }

const FormSchema = v.object({
  intent: v.literal('update-title'),
  text: v.pipe(
    v.string('Title must be a string.'),
    v.nonEmpty('Title must not be empty.'),
  ),
})

export async function action(args: Route.ActionArgs) {
  const cookie = getListsCookie(args, 'standard')
  const [formData, lists] = await Promise.all([
    args.request.formData(),
    cookie.get(),
  ])
  const form = v.parse(FormSchema, Object.fromEntries(formData.entries()))
  const list = lists.find((list) => list.id === args.params.id)

  if (!list) {
    throw data('List not found', { status: 404 })
  }

  switch (form.intent) {
    case 'update-title':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'Title of this list has been updated.',
            title: 'Update Successful',
            type: 'success',
          }),
          await cookie.save([{ ...list, name: form.text }]),
        ),
      })
  }
}

export async function loader(args: Route.LoaderArgs) {
  const lists = await getListsCookie(args, 'standard').get()
  const list = lists.find((list) => list.id === args.params.id)

  if (!list) {
    throw data('List not found', { status: 404 })
  }

  return { list }
}

const initialState = { selected: null, text: '' } satisfies State

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'done':
      return initialState
    case 'select':
      return action.data
    case 'type':
      return { ...state, text: action.data }
  }
}

export default function ListDetails({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const submit = useSubmit()

  function save() {
    submit(
      { intent: 'update-title', text: state.text },
      { flushSync: true, method: 'post' },
    )

    dispatch({ type: 'done' })
  }

  return (
    <>
      <title>{`${list.name} :: Lists`}</title>
      <div className="mx-auto max-w-2xl p-12">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              {state.selected === 'title' ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    autoFocus
                    className="font-semibold"
                    onChange={(event) =>
                      dispatch({ type: 'type', data: event.target.value })
                    }
                    onKeyDown={(event) => {
                      switch (event.key) {
                        case 'Enter':
                          return save()
                        case 'Escape':
                          return dispatch({ type: 'done' })
                      }
                    }}
                    placeholder="Enter a title..."
                    required
                    value={state.text}
                  />
                  <Button onClick={save} size="icon-sm">
                    <Icon name="check-2" />
                    <span className="sr-only">Save</span>
                  </Button>
                  <Button
                    onClick={() => dispatch({ type: 'done' })}
                    size="icon-sm"
                    variant="outline"
                  >
                    <Icon name="close" />
                    <span className="sr-only">Cancel</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <CardTitle>{list.name}</CardTitle>
                  <Button
                    onClick={() =>
                      dispatch({
                        type: 'select',
                        data: { selected: 'title', text: list.name },
                      })
                    }
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Icon name="edit" />
                    <span className="sr-only">Edit title</span>
                  </Button>
                </div>
              )}
            </div>
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
