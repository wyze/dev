import { Tabs as BaseTabs } from '@base-ui-components/react/tabs'
import { cn } from '@wyze/ui/helpers/cn'
import * as React from 'react'

type TabsVariant = 'capsule' | 'underline'

type TabsContext = {
  variant: TabsVariant
}

const TabsContext = React.createContext<TabsContext | null>(null)

const useTabs = () => {
  const context = React.useContext(TabsContext)

  if (!context) {
    throw new Error('useTabs must be used within a Tabs')
  }

  return context
}

function Tabs({
  variant = 'capsule',
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Root> & {
  variant?: TabsVariant
}) {
  return (
    <TabsContext.Provider value={{ variant }}>
      <BaseTabs.Root
        data-slot="tabs"
        className={cn('flex flex-col gap-2', className)}
        {...props}
      />
    </TabsContext.Provider>
  )
}

function TabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseTabs.List>) {
  const { variant } = useTabs()

  return (
    <BaseTabs.List
      data-slot="tabs-list"
      className={cn(
        'relative z-0 inline-flex h-9 w-fit items-center justify-center gap-x-1 p-1 text-muted-foreground',
        variant === 'capsule' ? 'rounded-lg bg-muted' : '',
        className,
      )}
      {...props}
    >
      {children}
      <TabIndicator />
    </BaseTabs.List>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Tab>) {
  const { variant } = useTabs()

  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        "z-[1] flex-1 items-center justify-center gap-1.5 whitespace-nowrap text-nowrap rounded-md px-2 py-1 text-muted-foreground text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === 'underline'
          ? 'data-selected:text-foreground'
          : 'data-selected:text-white',
        className,
      )}
      {...props}
    />
  )
}

function TabIndicator({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Indicator>) {
  const { variant } = useTabs()

  return (
    <BaseTabs.Indicator
      data-slot="tab-indicator"
      className={cn(
        '-translate-y-1/2 absolute left-0 w-[var(--active-tab-width)] translate-x-[var(--active-tab-left)] transition-all duration-300 ease-in-out',
        variant === 'underline'
          ? 'top-full z-10 h-px bg-primary'
          : '-z-[1] top-1/2 h-[var(--active-tab-height)] rounded-md border bg-primary/80 shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
