import { Icon } from '@wyze/icons'
import { Badge } from '@wyze/ui/badge'

import type { Route } from '../+types/details'

type List = Route.ComponentProps['loaderData']['list']
type Entry = Route.ComponentProps['loaderData']['entries'][number]

export const categories = [
  { label: 'Select category', value: null },
  { label: 'Produce', value: 'produce' },
  { label: 'Dairy', value: 'dairy' },
  { label: 'Meat', value: 'meat' },
  { label: 'Pantry', value: 'pantry' },
  { label: 'Frozen', value: 'frozen' },
  { label: 'Household', value: 'household' },
  { label: 'Personal Care', value: 'personal-care' },
  { label: 'Other', value: 'other' },
]

function AttributesCategory({ value }: { value?: string }) {
  if (value === undefined) {
    return null
  }

  return (
    <Badge>
      <span className="sr-only">Category</span>
      {categories.find((category) => category.value === value)?.label ?? value}
    </Badge>
  )
}

function AttributesPrice({ value }: { value?: number }) {
  if (value === undefined) {
    return null
  }

  const { format } = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return (
    <div className="flex items-center gap-1 rounded-lg border border-emerald-600/20 bg-emerald-600/10 px-1.5 py-0.5 text-emerald-600">
      <Icon name="dollar" className="size-5" reader="Price" />
      <span className="tabular-nums">{format(value)}</span>
    </div>
  )
}

function AttributesQuantity({ value }: { value?: number }) {
  if (value === undefined) {
    return null
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-600/20 bg-gray-600/10 px-2.5 py-0.5 text-gray-600">
      <span className="sr-only">Quantity</span>
      <span className="tabular-nums">{value.toLocaleString()}</span>
    </div>
  )
}

export function Attributes({
  attributes,
  type,
}: {
  attributes: Entry['attributes']
  type: List['type']
}) {
  if (Object.values(attributes ?? {}).filter(Boolean).length === 0) {
    return null
  }

  if (type === 'shopping') {
    return (
      <div className="flex items-center gap-3 px-1">
        <AttributesQuantity value={attributes?.quantity} />
        <AttributesPrice value={attributes?.price} />
        <AttributesCategory value={attributes?.category} />
      </div>
    )
  }

  return null
}
