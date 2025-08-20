import type * as React from 'react'

import spriteHref from '~/assets/sprite.svg'

import type { IconName } from './types'

export function Icon({
  name,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  name: IconName
}) {
  return (
    <svg {...props} aria-hidden="true">
      <use href={`${spriteHref}#${name}`} />
    </svg>
  )
}
