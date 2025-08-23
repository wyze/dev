import type * as React from 'react'

import spriteHref from '~/assets/sprite.svg'

import type { IconName } from './types'

export function Icon({
  name,
  reader,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  name: IconName
  reader?: string
}) {
  return (
    <>
      <svg {...props} aria-hidden="true">
        <use href={`${spriteHref}#${name}`} />
      </svg>
      {reader ? <span className="sr-only">{reader}</span> : null}
    </>
  )
}
