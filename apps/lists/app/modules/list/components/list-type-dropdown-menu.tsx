import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@wyze/ui/dropdown-menu'
import { useSubmit } from 'react-router'
import type * as v from 'valibot'

import type { Route } from '../+types/details'
import type { ListSchema } from '../helpers/schemas'

type List = Route.ComponentProps['loaderData']['list']

const options = [
  {
    label: 'Basic',
    description: 'A simple type of list',
    icon: 'unordered-list',
    value: 'basic',
  },
  {
    label: 'Shopping',
    description: 'Track your groceries or purchases',
    icon: 'shopping-cart',
    value: 'shopping',
  },
  {
    label: 'Todo',
    description: 'Track tasks and reminders',
    icon: 'checklist-2',
    value: 'todo',
  },
] satisfies Array<{
  label: string
  description: string
  icon: React.ComponentProps<typeof Icon>['name']
  value: v.InferOutput<typeof ListSchema>['type']
}>

export function ListTypeDropdownMenu({ list }: { list: List }) {
  const submit = useSubmit()
  const [selected] = options.filter((option) => option.value === list.type)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <Icon name={selected.icon} /> {selected.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>List Type</DropdownMenuLabel>
          {options.map(({ description, icon, label, value }) => {
            const checked = value === list.type

            return (
              <DropdownMenuCheckboxItem
                key={value}
                checked={checked}
                className={
                  checked ? 'font-semibold text-primary' : 'text-foreground'
                }
                onCheckedChange={() =>
                  submit(
                    { intent: 'change-list-type', type: value },
                    { method: 'post' },
                  )
                }
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name={icon} className="shrink-0" />
                    <div className="flex flex-col">
                      <span>{label}</span>
                      <span className="font-normal text-muted-foreground text-xs">
                        {description}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuCheckboxItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
