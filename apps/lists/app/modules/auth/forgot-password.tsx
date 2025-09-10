import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import * as v from 'valibot'

import { auth } from '~/.server/auth'
import { redirectWithToast } from '~/.server/toast'

import type { Route } from './+types/sign-up'
import { AuthForm } from './components/auth-form'
import { EmailInput } from './components/email-input'
import { ErrorSchema } from './helpers/schemas'
import { useIsNavigating } from './hooks/use-is-navigating'

const FormSchema = v.object({
  intent: v.literal('send-reset-link'),
  email: v.pipe(
    v.string('Must be a string.'),
    v.email('Must be an email address.'),
  ),
})

export async function action(args: Route.ActionArgs) {
  const { request } = args
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
    case 'send-reset-link':
      try {
        const { status } = await auth.api.requestPasswordReset({
          body: { email: form.email, redirectTo: '/reset-password' },
        })

        return redirectWithToast(
          args,
          request.url,
          status
            ? {
                title: 'Link sent',
                description: 'A password reset link was sent to your email.',
                type: 'success',
              }
            : {
                title: 'Unable to send',
                description:
                  'There was an issue sending your password reset link.',
                type: 'error',
              },
        )
      } catch (error) {
        const value = v.parse(ErrorSchema, error)

        return { ok: false, value }
      }
  }
}

export default function ForgotPasswordRoute() {
  const isNavigating = useIsNavigating()

  return (
    <>
      <title>Forgot password · Lists</title>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your
            password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <AuthForm>
              <EmailInput />
              <Button
                className="w-full text-sm"
                disabled={isNavigating}
                name="intent"
                type="submit"
                value="send-reset-link"
              >
                {isNavigating ? 'Sending reset link...' : 'Send reset link'}
              </Button>
            </AuthForm>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
