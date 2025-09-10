import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { data, redirect } from 'react-router'
import * as v from 'valibot'

import { auth } from '~/.server/auth'
import { redirectWithToast } from '~/.server/toast'
import type { Result } from '~/types'

import type { Route } from './+types/sign-up'
import { AuthForm } from './components/auth-form'
import { PasswordInput } from './components/password-input'
import { ErrorSchema, PasswordSchema } from './helpers/schemas'
import { useIsNavigating } from './hooks/use-is-navigating'

const FormSchema = v.pipe(
  v.object({
    intent: v.literal('update-password'),
    confirm: PasswordSchema,
    password: PasswordSchema,
  }),
  v.check(
    (value) => value.confirm === value.password,
    "Passwords don't match.",
  ),
)

const SearchParamsSchema = v.object({
  token: v.pipe(
    v.string('Must be a string.'),
    v.nonEmpty('Must not be empty.'),
  ),
})

function parse<T extends v.GenericSchema>(
  Schema: T,
  entries: FormData | URLSearchParams,
): Result<v.InferOutput<T>, string> {
  const parsed = v.safeParse(Schema, Object.fromEntries(entries.entries()))

  if (!parsed.success) {
    return {
      ok: false,
      value: parsed.issues.at(0)?.message ?? 'Unknown parsing error occurred',
    }
  }

  return { ok: true, value: parsed.output }
}

export async function action(args: Route.ActionArgs) {
  const { request } = args
  const form = parse(FormSchema, await request.formData())
  const params = parse(SearchParamsSchema, new URL(request.url).searchParams)

  if (!form.ok) {
    return form
  }

  if (!params.ok) {
    return params
  }

  switch (form.value.intent) {
    case 'update-password':
      try {
        const { status } = await auth.api.resetPassword({
          body: { newPassword: form.value.password, token: params.value.token },
        })

        if (status) {
          return redirectWithToast(args, '/sign-in', {
            title: 'Change successful',
            description: 'Your password has been changed.',
            type: 'success',
          })
        }

        return data({ ok: status, value: null })
      } catch (error) {
        const value = v.parse(ErrorSchema, error)

        return { ok: false, value }
      }
  }
}

export async function loader({ context, request }: Route.LoaderArgs) {
  if (context.cloudflare.env.RESEND_API_KEY === 're_test') {
    const verification = await context.db
      .selectFrom('verification')
      .select('identifier')
      .where('identifier', 'like', 'reset-password:%')
      .where('expires_at', '>', new Date())
      .limit(1)
      .orderBy('expires_at', 'desc')
      .executeTakeFirst()

    const [, token] = verification?.identifier.split(':') ?? []

    if (token && !request.url.includes(token)) {
      return redirect(`?token=${token}`)
    }
  }
}

export default function ResetPasswordRoute() {
  const isNavigating = useIsNavigating()

  return (
    <>
      <title>Reset password · Lists</title>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create a new password</CardTitle>
          <CardDescription>
            Choose a new password that is different than your previous password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <AuthForm>
              <PasswordInput />
              <PasswordInput label="Confirm" />
              <Button
                className="w-full text-sm"
                disabled={isNavigating}
                name="intent"
                type="submit"
                value="update-password"
              >
                {isNavigating ? 'Updating password...' : 'Update password'}
              </Button>
            </AuthForm>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
