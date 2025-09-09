import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { data, Link, redirect } from 'react-router'
import * as v from 'valibot'

import { auth } from '~/.server/auth'

import type { Route } from './+types/sign-in'
import { AuthForm } from './components/auth-form'
import { EmailInput } from './components/email-input'
import { PasswordInput } from './components/password-input'
import { SocialButtons } from './components/social-buttons'
import { ErrorSchema, FormSchema } from './helpers/schemas'
import { useAuthAction } from './hooks/use-auth-action'
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
      const body = { ...rest, callbackURL: '/' }

      try {
        const { headers } = await auth.api.signInEmail({
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
            provider: form.provider,
            callbackURL: '/',
            errorCallbackURL: '/sign-in',
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

export default function SigninRoute() {
  const { action } = useAuthAction()
  const isNavigating = useIsNavigating()

  return (
    <>
      <title>Sign in · Lists</title>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            {action} with your GitHub or Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <SocialButtons />
            <AuthForm>
              <EmailInput />
              <PasswordInput />
              <Button
                className="w-full text-sm"
                disabled={isNavigating}
                name="intent"
                type="submit"
                value="email"
              >
                {isNavigating ? 'Signing in...' : 'Sign in'}
              </Button>
            </AuthForm>
            <div className="text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link to="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
