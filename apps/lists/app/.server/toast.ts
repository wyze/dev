import type { AppLoadContext } from 'react-router'
import * as v from 'valibot'

import { create } from './session'

const ToastSchema = v.object({
  description: v.optional(
    v.pipe(v.string('Must be a string'), v.nonEmpty('Must not be empty.')),
  ),
  title: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
  type: v.picklist(['error', 'info', 'success', 'warning']),
})

const session = create('toast', v.optional(v.nullable(ToastSchema), null))

export async function createToast(
  args: { context: AppLoadContext; request: Request },
  input: v.InferInput<typeof ToastSchema>,
) {
  const s = await session(args)

  s.flash(input)

  return s.commit()
}

export async function getToast(args: {
  context: AppLoadContext
  request: Request
}) {
  const s = await session(args)
  const toast = s.get()

  return { headers: await s.destroy(), toast }
}
