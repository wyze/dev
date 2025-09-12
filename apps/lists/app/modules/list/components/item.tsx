import { useSortable } from '@dnd-kit/react/sortable'
import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import { Checkbox } from '@wyze/ui/checkbox'
import { Field, FieldLabel } from '@wyze/ui/field'
import { cn } from '@wyze/ui/helpers/cn'
import { Input } from '@wyze/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@wyze/ui/select'
import type * as React from 'react'
import * as Aria from 'react-aria-components'
import { Form, useSubmit } from 'react-router'

import { Attributes, categories } from './attributes'
import type { Route } from '../+types/details'

type Actions = {
  done: () => void
  keydown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  save: () => void
  select: (id: Entry['id'], text: string) => void
  type: (text: string) => void
}
type List = Route.ComponentProps['loaderData']['list']
type Entry = Route.ComponentProps['loaderData']['entries'][number]
type State = { type: 'default' } | { type: 'selected'; text: string }

function AriaButton({
  className,
  ...props
}: React.ComponentProps<typeof Aria.Button>) {
  return (
    <Aria.Button
      {...props}
      className={cn(
        'flex aspect-square h-[inherit] items-center justify-center border border-gray-400/60 bg-input text-muted-foreground/80 text-sm transition-[color,box-shadow] hover:bg-accent/50 hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
    />
  )
}

function AriaGroup(props: React.ComponentProps<typeof Aria.Group>) {
  return (
    <Aria.Group
      className="relative inline-flex h-8 w-full items-center overflow-hidden whitespace-nowrap rounded-md border border-gray-400/60 text-sm shadow-xs outline-none transition-[color,box-shadow] group-hover/form:border-ring/70 data-focus-within:border-ring data-disabled:opacity-50 data-focus-within:ring-[3px] data-focus-within:ring-ring/50 data-focus-within:has-aria-invalid:border-destructive data-focus-within:has-aria-invalid:ring-destructive/20 dark:data-focus-within:has-aria-invalid:ring-destructive/40"
      {...props}
    />
  )
}

export function Item({
  actions,
  entry,
  index,
  state,
  type,
}: {
  actions: Actions
  entry: Entry
  index: number
  state: State
  type: List['type']
}) {
  const submit = useSubmit()
  const { ref } = useSortable({
    id: entry.id,
    index,
    feedback: 'clone',
  })

  return (
    // biome-ignore lint/a11y/useSemanticElements: dnd-kit adds role="button" so we must override
    <div ref={ref} className="group" role="listitem">
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border bg-white p-3 transition-all hover:bg-muted/50 group-aria-hidden:opacity-60',
          { 'cursor-move': state.type !== 'selected' },
        )}
      >
        {state.type === 'selected' ? (
          <Form
            className="flex-1 space-y-4"
            method="post"
            onSubmit={actions.done}
          >
            <input type="hidden" name="id" value={entry.id} />
            <div className="flex items-center gap-3">
              <Input
                autoFocus
                className="flex-1"
                name="content"
                onChange={(event) => actions.type(event.target.value)}
                onKeyDown={actions.keydown}
                placeholder="What would you like to do?"
                required
                value={state.text}
              />
              <Button
                name="intent"
                size="icon-sm"
                type="submit"
                value="update-item"
              >
                <Icon name="check-2" reader="Save" />
              </Button>
              <Button onClick={actions.done} size="icon-sm" variant="outline">
                <Icon name="close" reader="Cancel" />
              </Button>
            </div>
            {type === 'shopping' ? (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Aria.NumberField
                  defaultValue={entry.attributes?.quantity}
                  minValue={0}
                >
                  <div className="group/form space-y-2">
                    <Aria.Label className="flex font-medium text-foreground text-sm">
                      Quantity
                    </Aria.Label>
                    <AriaGroup>
                      <AriaButton
                        slot="decrement"
                        className="-ms-px rounded-s-md"
                      >
                        <Icon className="size-4" name="minus" />
                      </AriaButton>
                      <Aria.Input
                        className="w-full grow bg-input px-3 py-2 text-center text-foreground tabular-nums focus-visible:outline-0"
                        name="quantity"
                      />
                      <AriaButton
                        slot="increment"
                        className="-me-px rounded-e-md"
                      >
                        <Icon className="size-4" name="plus" />
                      </AriaButton>
                    </AriaGroup>
                  </div>
                </Aria.NumberField>
                <Aria.NumberField
                  defaultValue={entry.attributes?.price}
                  formatOptions={{
                    style: 'currency',
                    currency: 'USD',
                    currencySign: 'accounting',
                  }}
                >
                  <div className="group/form space-y-2">
                    <Aria.Label className="flex font-medium text-foreground text-sm">
                      Price
                    </Aria.Label>
                    <AriaGroup>
                      <Aria.Input
                        className="w-28 flex-1 bg-input px-3 py-2 text-foreground tabular-nums focus-within:outline-0"
                        name="price"
                      />
                      <div className="flex h-[calc(100%+2px)] flex-col">
                        <AriaButton
                          slot="increment"
                          className="-me-px flex h-1/2 w-6 flex-1"
                        >
                          <Icon className="size-3" name="chevron-up" />
                        </AriaButton>
                        <AriaButton
                          slot="decrement"
                          className="-me-px -mt-px flex h-1/2 w-6 flex-1"
                        >
                          <Icon className="size-3" name="chevron-down" />
                        </AriaButton>
                      </div>
                    </AriaGroup>
                  </div>
                </Aria.NumberField>
                <Field className="group/form space-y-2">
                  <FieldLabel className="flex font-medium text-foreground text-sm">
                    Category
                  </FieldLabel>
                  <Select
                    defaultValue={entry.attributes?.category}
                    items={categories}
                    name="category"
                  >
                    <SelectTrigger
                      className={(state) =>
                        cn(
                          'group-hover/form:border-ring/70 data-focused:border-ring data-focused:ring-[3px] data-focused:ring-ring/50',
                          state.value ? '' : 'text-muted-foreground',
                        )
                      }
                      size="sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            ) : null}
          </Form>
        ) : (
          <div className="flex flex-1 flex-col gap-1">
            <div className="flex flex-1 items-center gap-3">
              {type === 'todo' ? (
                <Checkbox
                  checked={Boolean(entry.completed_at)}
                  onCheckedChange={(checked) =>
                    submit(
                      {
                        intent: 'update-item-completed-at',
                        id: entry.id,
                        completed_at: checked ? new Date().toISOString() : null,
                      },
                      { method: 'post' },
                    )
                  }
                />
              ) : null}
              <Icon
                className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                name="dot-grid-vertical-2x3"
                reader="Reorder"
              />
              <span
                className={cn('flex-1', {
                  'text-muted-foreground line-through':
                    type === 'todo' && Boolean(entry.completed_at),
                })}
              >
                {entry.content}
              </span>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  className="border border-transparent hover:border-accent-foreground/50"
                  onClick={() => actions.select(entry.id, entry.content)}
                  onPointerDown={(event) => event.stopPropagation()}
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
                  onPointerDown={(event) => event.stopPropagation()}
                  size="icon-sm"
                  variant="ghost"
                >
                  <Icon name="trash" reader="Delete item" />
                </Button>
              </div>
            </div>
            <Attributes attributes={entry.attributes} type={type} />
          </div>
        )}
      </div>
    </div>
  )
}
