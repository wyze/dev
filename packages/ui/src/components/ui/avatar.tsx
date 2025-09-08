import { Avatar as AvatarBase } from '@base-ui-components/react/avatar'
import { cn } from '@wyze/ui/helpers/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'size-8 text-sm',
        md: 'size-10',
        lg: 'size-12 text-lg',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

function Avatar({
  className,
  size,
  ...props
}: React.ComponentProps<typeof AvatarBase.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarBase.Root
      data-slot="avatar"
      className={cn(avatarVariants({ size }), className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Image>) {
  return (
    <AvatarBase.Image
      data-slot="avatar-image"
      className={cn('size-full object-cover', className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarBase.Fallback>) {
  return (
    <AvatarBase.Fallback
      data-slot="avatar-fallback"
      className={cn(
        'flex size-full select-none items-center justify-center rounded-full bg-muted',
        className,
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
