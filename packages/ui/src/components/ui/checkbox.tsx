import { Checkbox as BaseCheckbox } from '@base-ui-components/react/checkbox'
import { Icon } from '@wyze/icons'
import { cn } from '@wyze/ui/helpers/cn'
import type * as React from 'react'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof BaseCheckbox.Root>) {
  return (
    <BaseCheckbox.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-4 items-center justify-center rounded-[4px] border bg-input outline-none transition-colors duration-150 focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:text-destructive aria-invalid:focus:ring-destructive/50 data-checked:border-primary data-checked:bg-primary data-[indeterminate]:text-foreground data-checked:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <BaseCheckbox.Indicator
        data-slot="checkbox-indicator"
        className="block data-[unchecked]:hidden"
      >
        {props.indeterminate ? (
          <Icon name="minus" className="size-3.5" />
        ) : (
          <Icon name="checkmark" className="size-3.5" />
        )}
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}

export { Checkbox }
