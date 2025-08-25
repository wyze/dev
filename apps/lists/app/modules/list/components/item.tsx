import { useSortable } from '@dnd-kit/react/sortable'
import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import { cn } from '@wyze/ui/helpers/cn'
import { Input } from '@wyze/ui/input'
import { useSubmit } from 'react-router'

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
  index,
  state,
}: {
  actions: Actions
  entry: Entry
  index: number
  state: State
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
            <Icon
              className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              name="dot-grid-vertical-2x3"
              reader="Reorder"
            />
            <span className="flex-1">{entry.label}</span>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                className="border border-transparent hover:border-accent-foreground/50"
                onClick={() => actions.select(entry.id, entry.label)}
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
          </>
        )}
      </div>
    </div>
  )
}
