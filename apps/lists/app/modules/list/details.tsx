import type { Modifiers } from '@dnd-kit/abstract'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { Input } from '@wyze/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@wyze/ui/tabs'
import * as React from 'react'
import { data, useNavigation, useSubmit } from 'react-router'
import * as v from 'valibot'

import { createToast } from '~/.server/toast'
import { combineHeaders } from '~/helpers/combine-headers'
import { createUuid, type Uuid, UuidSchema } from '~/helpers/create-uuid'
import { pluralize } from '~/helpers/pluralize'

import type { Route } from './+types/details'
import { Item } from './components/item'
import { getListsCookie } from './helpers/get-lists-cookie'
import { ListSchema } from './helpers/schemas'

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
    intent: v.literal('change-list-type'),
    type: v.nonOptional(ListSchema.entries.type),
  }),
  v.object({
    intent: v.literal('delete-item'),
    id: UuidSchema,
  }),
  v.object({
    intent: v.literal('reorder-items'),
    order: v.pipe(
      v.string(),
      v.transform((value) => value.split(',')),
      v.pipe(
        v.array(UuidSchema),
        v.minLength(1, 'Must have 1 item in the list.'),
      ),
    ),
  }),
  v.object({
    intent: v.literal('update-item-completed-at'),
    id: UuidSchema,
    completed_at: v.nullable(
      v.pipe(
        v.string('Value must be a string.'),
        v.nonEmpty('Value must not be empty.'),
        v.transform((value) => (value === 'null' ? null : value)),
        v.check((value) => {
          try {
            return !value || new Date(value) instanceof Date
          } catch {
            return false
          }
        }),
      ),
    ),
  }),
  v.object({
    intent: v.literal('update-item-label'),
    id: UuidSchema,
    label: v.pipe(
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
                completed_at: null,
                label: form.text,
              }),
            },
          ]),
        ),
      })
    case 'change-list-type':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The type of list has been changed.',
            title: 'List Update Successful',
            type: 'success',
          }),
          await cookie.save([{ ...list, type: form.type }]),
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
    case 'reorder-items':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The items have been reordered in the list.',
            title: 'Reorder Item Successful',
            type: 'success',
          }),
          await cookie.save([
            {
              ...list,
              entries: form.order
                .map((id) => list.entries.find((entry) => entry.id === id))
                .filter((entry): entry is NonNullable<typeof entry> =>
                  Boolean(entry),
                ),
            },
          ]),
        ),
      })
    case 'update-item-completed-at':
      return data(null, {
        headers: combineHeaders(
          await createToast(args, {
            description: 'The list entry completion was updated.',
            title: 'Update Successful',
            type: 'success',
          }),
          await cookie.save([
            {
              ...list,
              entries: list.entries.map((entry) =>
                entry.id === form.id
                  ? { ...entry, completed_at: form.completed_at }
                  : entry,
              ),
            },
          ]),
        ),
      })
    case 'update-item-label':
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
                entry.id === form.id ? { ...entry, label: form.label } : entry,
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

const initialState = {
  add: '',
  selected: null,
  text: '',
} satisfies State

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
  const navigation = useNavigation()
  const submit = useSubmit()

  const save = React.useCallback(
    function save() {
      let payload: v.InferOutput<typeof FormSchema>

      if (state.selected === 'title') {
        payload = { intent: 'update-title', text: state.text }
      } else if (state.selected === null) {
        payload = { intent: 'add-item', text: state.add }
      } else {
        payload = {
          intent: 'update-item-label',
          id: state.selected,
          label: state.text,
        }
      }

      submit(payload, { flushSync: true, method: 'post' })

      dispatch({ type: 'done' })
    },
    [state.add, state.selected, state.text, submit],
  )

  const keydown = React.useCallback(
    function keydown(event: React.KeyboardEvent<HTMLInputElement>) {
      switch (event.key) {
        case 'Enter':
          return save()
        case 'Escape':
          return dispatch({ type: 'done' })
      }
    },
    [save],
  )

  const actions = React.useMemo(
    () => ({
      done() {
        dispatch({ type: 'done' })
      },
      keydown,
      save,
      select(selected: Uuid, text: string) {
        dispatch({ type: 'select', data: { selected, text } })
      },
      type(data: string) {
        dispatch({ type: 'set-text', data })
      },
    }),
    [keydown, save],
  )

  const entriesHash = list.entries.reduce<
    Record<Uuid, (typeof list.entries)[number]>
  >((acc, entry) => {
    acc[entry.id] = entry

    return acc
  }, {})

  const entries =
    navigation.formData?.get('intent') === 'reorder-items'
      ? (navigation.formData
          .get('order')
          ?.toString()
          .split(',')
          .map((id) => entriesHash[id as Uuid]) ?? [])
      : list.entries

  const completed = entries.filter((entry) => entry.completed_at).length

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
              <Tabs
                onValueChange={(type) =>
                  submit(
                    { intent: 'change-list-type', type },
                    { method: 'post' },
                  )
                }
                value={list.type}
              >
                <TabsList>
                  <TabsTrigger className="flex items-center" value="basic">
                    <Icon name="unordered-list" /> Basic
                  </TabsTrigger>
                  <TabsTrigger className="flex items-center" value="todo">
                    <Icon name="checklist-2" /> Todo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription>
              {list.type === 'todo'
                ? `${completed} of ${entries.length} completed`
                : pluralize('item', entries.length)}
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
            <DragDropProvider
              modifiers={[RestrictToVerticalAxis] as Modifiers}
              onDragEnd={(event) => {
                const moved = move(entries, event)

                if (moved !== entries) {
                  submit(
                    {
                      intent: 'reorder-items',
                      order: moved.map((item) => item.id),
                    },
                    { method: 'post' },
                  )
                }
              }}
            >
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <Item
                    key={entry.id}
                    actions={actions}
                    entry={entry}
                    index={index}
                    state={
                      state.selected === entry.id
                        ? { type: 'selected', text: state.text }
                        : { type: 'default' }
                    }
                    type={list.type}
                  />
                ))}
              </div>
            </DragDropProvider>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
