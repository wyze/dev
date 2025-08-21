import type { AppLoadContext } from 'react-router'
import { redirect } from 'react-router'
import * as v from 'valibot'

import { combineHeaders } from '~/helpers/combine-headers'
import type { ServerArgs } from '~/types'

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

type ToastInput = v.InferInput<typeof ToastSchema>

const getSession = create('toast', v.optional(v.nullable(ToastSchema), null))

export async function createToast(args: ServerArgs, input: ToastInput) {
  const session = await getSession(args)

  session.flash(input)

  return session.commit()
}

export async function getToast(args: {
  context: AppLoadContext
  request: Request
}) {
  const session = await getSession(args)
  const toast = session.get()

  return { headers: await session.destroy(), toast }
}

export async function redirectWithToast(
  args: ServerArgs,
  url: string,
  input: ToastInput,
  init?: ResponseInit,
) {
  return redirect(url, {
    ...init,
    headers: combineHeaders(init?.headers, await createToast(args, input)),
  })
}
