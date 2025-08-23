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
import { createUuid, type Uuid, UuidSchema } from '~/helpers/create-uuid'
import { pluralize } from '~/helpers/pluralize'
import { Icon } from '~/modules/icon'

import type { Route } from './+types/details'
import { getListsCookie } from './helpers/get-lists-cookie'

type State = {
  add: string
  selected: Uuid | 'title' | null
  text: string
}

type Action =
  | { type: 'done' }
  | { type: 'select'; data: Pick<State, 'selected' | 'text'> }
  | { type: 'set-add' | 'set-text'; data: State['text'] }

const FormSchema = v.variant('intent', [
  v.object({
    intent: v.literal('add-item'),
    text: v.pipe(
      v.string('Item must be a string.'),
      v.nonEmpty('Item must not be empty.'),
    ),
  }),
  v.object({
    intent: v.literal('delete-item'),
    id: UuidSchema,
  }),
  v.object({
    intent: v.literal('update-item'),
    id: UuidSchema,
    text: v.pipe(
      v.string('Item must be a string.'),
      v.nonEmpty('Item must not be empty.'),
    ),
  }),
  v.object({
    intent: v.literal('update-title'),
    text: v.pipe(
      v.string('Title must be a string.'),
      v.nonEmpty('Title must not be empty.'),
    ),
  }),
])

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
    case 'add-item':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The item has been added to the list.',
            title: 'Add Item Successful',
            type: 'success',
          }),
          await cookie.save([
            {
              ...list,
              entries: list.entries.concat({
                id: createUuid(),
                label: form.text,
              }),
            },
          ]),
        ),
      })
    case 'delete-item':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The item has been removed from the list.',
            title: 'Delete Item Successful',
            type: 'success',
          }),
          await cookie.save([
            {
              ...list,
              entries: list.entries.filter((entry) => entry.id !== form.id),
            },
          ]),
        ),
      })
    case 'update-item':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The list entry label was updated.',
            title: 'Update Successful',
            type: 'success',
          }),
          await cookie.save([
            {
              ...list,
              entries: list.entries.map((entry) =>
                entry.id === form.id ? { ...entry, label: form.text } : entry,
              ),
            },
          ]),
        ),
      })
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

const initialState = { add: '', selected: null, text: '' } satisfies State

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'done':
      return initialState
    case 'select':
      return { ...state, ...action.data }
    case 'set-add':
      return { ...state, add: action.data }
    case 'set-text':
      return { ...state, text: action.data }
  }
}

export default function ListDetails({ loaderData }: Route.ComponentProps) {
  const { list } = loaderData
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const submit = useSubmit()

  function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'Enter':
        return save()
      case 'Escape':
        return dispatch({ type: 'done' })
    }
  }

  function save() {
    let payload: v.InferOutput<typeof FormSchema>

    if (state.selected === 'title') {
      payload = { intent: 'update-title', text: state.text }
    } else if (state.selected === null) {
      payload = { intent: 'add-item', text: state.add }
    } else {
      payload = { intent: 'update-item', id: state.selected, text: state.text }
    }

    submit(payload, { flushSync: true, method: 'post' })

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
                      dispatch({ type: 'set-text', data: event.target.value })
                    }
                    onKeyDown={keydown}
                    placeholder="Enter a title..."
                    required
                    value={state.text}
                  />
                  <Button
                    disabled={state.text.trim() === ''}
                    onClick={save}
                    size="icon-sm"
                  >
                    <Icon name="check-2" reader="Save" />
                  </Button>
                  <Button
                    onClick={() => dispatch({ type: 'done' })}
                    size="icon-sm"
                    variant="outline"
                  >
                    <Icon name="close" reader="Cancel" />
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
                    <Icon name="edit" reader="Edit title" />
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              {pluralize('item', list.entries.length)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input
                className="flex-1"
                onChange={(event) =>
                  dispatch({ type: 'set-add', data: event.target.value })
                }
                onKeyDown={keydown}
                placeholder="Add new item..."
                value={state.add}
              />
              <Button
                disabled={state.add.trim() === ''}
                onClick={save}
                size="icon-sm"
                type="submit"
              >
                <Icon name="plus" reader="Add item" />
              </Button>
            </div>
            <div className="space-y-2">
              {list.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  {state.selected === entry.id ? (
                    <>
                      <Input
                        autoFocus
                        className="flex-1"
                        onChange={(event) =>
                          dispatch({
                            type: 'set-text',
                            data: event.target.value,
                          })
                        }
                        onKeyDown={keydown}
                        placeholder="What would you like to do?"
                        value={state.text}
                      />
                      <Button
                        disabled={state.text.trim() === ''}
                        onClick={save}
                        size="icon-sm"
                      >
                        <Icon name="check-2" reader="Save" />
                      </Button>
                      <Button
                        onClick={() => dispatch({ type: 'done' })}
                        size="icon-sm"
                        variant="outline"
                      >
                        <Icon name="close" reader="Cancel" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{entry.label}</span>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          className="border border-transparent hover:border-accent-foreground/50"
                          onClick={() =>
                            dispatch({
                              type: 'select',
                              data: { selected: entry.id, text: entry.label },
                            })
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Icon name="edit" reader="Edit item" />
                        </Button>
                        <Button
                          className="transition-colors hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() =>
                            submit(
                              { intent: 'delete-item', id: entry.id },
                              { method: 'post' },
                            )
                          }
                          size="icon-sm"
                          variant="ghost"
                        >
                          <Icon name="trash" reader="Delete item" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
