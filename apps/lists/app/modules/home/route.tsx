import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import { Card, CardContent } from '@wyze/ui/card'
import { Input } from '@wyze/ui/input'
import { APIError } from 'better-auth/api'
import mnemonicWords from 'mnemonic-words'
import * as React from 'react'
import { Form, redirect } from 'react-router'
import * as v from 'valibot'

import { auth } from '~/.server/auth'
import { redirectWithToast } from '~/.server/toast'
import { capitalize } from '~/helpers/capitalize'
import { combineHeaders } from '~/helpers/combine-headers'
import { createUuid } from '~/helpers/create-uuid'
import { randomItem } from '~/helpers/random-item'
import { getListsCookie } from '~/modules/list/helpers/get-lists-cookie'
import { ListsSchema } from '~/modules/list/helpers/schemas'
import type { ServerArgs } from '~/types'

import type { Route } from './+types/route'

function redirectWithErrorToast(
  args: ServerArgs,
  title: string,
  description?: string,
) {
  return redirectWithToast(args, '/', {
    description,
    title,
    type: 'error',
  })
}

async function trySignIn(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      return await auth.api.signInAnonymous({
        headers: request.headers,
        returnHeaders: true,
      })
    }
  } catch (error) {
    if (error instanceof APIError) {
      console.error(error.message, error.status)
    }

    if (error instanceof Error) {
      console.error(error)
    }
  }
}

export async function action(args: Route.ActionArgs) {
  const cookie = getListsCookie(args, 'nullable')
  const formData = await args.request.formData()

  const label = v.safeParse(
    v.pipe(
      v.string('Must be a string.'),
      v.nonEmpty('Must have a minimum length of 1.'),
    ),
    formData.get('entry'),
  )

  if (!label.success) {
    return redirectWithErrorToast(
      args,
      'Entry parse error',
      label.issues.map((issue) => issue.message).join(' '),
    )
  }

  const name = capitalize(
    new Array(3)
      .fill(0)
      .map(() => randomItem(mnemonicWords))
      .join(' '),
  )

  try {
    const id = createUuid()
    const lists = v.parse(ListsSchema, [
      { entries: [{ id: createUuid(), label: label.output }], id, name },
    ])
    const [headers, signIn] = await Promise.all([
      cookie.save(lists),
      trySignIn(args.request),
    ])

    return redirect(`lists/${id}`, {
      headers: combineHeaders(headers, signIn?.headers),
    })
  } catch (error) {
    switch (true) {
      case error instanceof v.ValiError:
        return redirectWithErrorToast(
          args,
          'List parse error',
          error.issues.map((issue) => issue.message).join(' '),
        )
      case error instanceof Error:
        return redirectWithErrorToast(args, 'Generic error', error.message)
      default:
        return redirectWithErrorToast(args, 'Unknown exception', `${error}`)
    }
  }
}

export async function loader(args: Route.LoaderArgs) {
  const lists = await getListsCookie(args, 'nullable').get()

  return { lists }
}

export default function Home() {
  const [text, setText] = React.useState('')

  return (
    <>
      <title>Lists</title>
      <meta
        name="description"
        content="An application to make various kinds of lists."
      />
      <div className="flex items-center justify-center p-4 pt-16">
        <Card className="w-full max-w-md">
          <CardContent className="space-y-6 p-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-orange-100">
                <Icon
                  className="size-8 text-orange-600"
                  name="unordered-list"
                />
              </div>
              <h2 className="mb-2 font-semibold text-2xl text-gray-900">
                Add your first item
              </h2>
              <p className="text-gray-600 text-sm">
                Start building your list by adding your first item. You can
                organize and manage everything from here.
              </p>
            </div>
            <Form className="space-y-4" method="post">
              <div className="space-y-2">
                <Input
                  autoFocus
                  className="text-center"
                  name="entry"
                  onChange={(event) => setText(event.target.value)}
                  placeholder="What do you want to add?"
                  type="text"
                  value={text}
                />
              </div>
              <Button
                className="w-full gap-2"
                disabled={text.trim() === ''}
                type="submit"
              >
                <Icon className="size-4" name="plus" />
                Add Item
              </Button>
            </Form>
            <div className="border-gray-200 border-t pt-6">
              <p className="text-gray-500 text-xs">
                You can add more items and create additional lists later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
