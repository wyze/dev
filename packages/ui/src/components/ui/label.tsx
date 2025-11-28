import { cn } from '@wyze/ui/helpers/cn'
import type * as React from 'react'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: We will add a control when used
    <label
      className={cn(
        'flex select-none items-center gap-2 font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-data-disabled:opacity-50',
        className
      )}
      data-slot="label"
      {...props}
    />
  )
}

export { Label }
