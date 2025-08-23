import { Button } from '@wyze/ui/button'
import { Input } from '@wyze/ui/input'
import { useSubmit } from 'react-router'

import { Icon } from '~/modules/icon'

import type { Route } from '../+types/details'

type Actions = {
  done: () => void
  keydown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  save: () => void
  select: (id: Entry['id'], text: string) => void
  type: (text: string) => void
}
type Entry = Route.ComponentProps['loaderData']['list']['entries'][number]
type State = { type: 'default' } | { type: 'selected'; text: string }

export function Item({
  actions,
  entry,
  state,
}: {
  actions: Actions
  entry: Entry
  state: State
}) {
  const submit = useSubmit()

  return (
    <div className="group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      {state.type === 'selected' ? (
        <>
          <Input
            autoFocus
            className="flex-1"
            onChange={(event) => actions.type(event.target.value)}
            onKeyDown={actions.keydown}
            placeholder="What would you like to do?"
            value={state.text}
          />
          <Button
            disabled={state.text.trim() === ''}
            onClick={actions.save}
            size="icon-sm"
          >
            <Icon name="check-2" reader="Save" />
          </Button>
          <Button onClick={actions.done} size="icon-sm" variant="outline">
            <Icon name="close" reader="Cancel" />
          </Button>
        </>
      ) : (
        <>
          <span className="flex-1">{entry.label}</span>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              className="border border-transparent hover:border-accent-foreground/50"
              onClick={() => actions.select(entry.id, entry.label)}
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
  )
}
