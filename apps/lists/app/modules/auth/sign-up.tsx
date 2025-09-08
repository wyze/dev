import { Button } from '@wyze/ui/button'
import { data, redirect } from 'react-router'
import * as v from 'valibot'

import { auth } from '~/.server/auth'

import type { Route } from './+types/sign-up'
import { ErrorSchema, FormSchema } from './helpers/schemas'
import { useIsNavigating } from './hooks/use-is-navigating'

export async function action({ request }: Route.ActionArgs) {
  const parsed = v.safeParse(
    FormSchema,
    Object.fromEntries((await request.formData()).entries()),
  )

  if (!parsed.success) {
    return {
      ok: false,
      value: parsed.issues.at(0)?.message ?? 'Unknown parsing error occurred',
    }
  }

  const form = parsed.output

  switch (form.intent) {
    case 'email': {
      const { intent: _intent, ...rest } = form
      const [name] = rest.email.split('@')
      const body = { ...rest, callbackURL: '/', name, username: name }

      try {
        const { headers } = await auth.api.signUpEmail({
          body,
          headers: request.headers,
          returnHeaders: true,
        })

        return data({ ok: true, value: null }, { headers })
      } catch (error) {
        const value = v.parse(ErrorSchema, error)

        return { ok: false, value }
      }
    }
    case 'social': {
      try {
        const { headers, response } = await auth.api.signInSocial({
          body: {
            callbackURL: '/',
            provider: form.provider,
            requestSignUp: true,
          },
          headers: request.headers,
          returnHeaders: true,
        })

        if (response.redirect) {
          return redirect(`${response.url}`)
        }

        return data({ ok: true, value: null }, { headers })
      } catch (error) {
        const value = v.parse(ErrorSchema, error)

        return { ok: false, value }
      }
    }
  }
}

export default function SignupRoute() {
  const isNavigating = useIsNavigating()

  return (
    <>
      <title>Sign up · Lists</title>

      <Button
        className="w-full"
        disabled={isNavigating}
        name="intent"
        type="submit"
        value="email"
      >
        {isNavigating ? 'Creating account...' : 'Create account'}
      </Button>
    </>
  )
}
