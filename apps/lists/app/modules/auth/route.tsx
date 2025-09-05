import { Icon } from '@wyze/icons'
import { Alert, AlertTitle } from '@wyze/ui/alert'
import { Button } from '@wyze/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@wyze/ui/card'
import { Input } from '@wyze/ui/input'
import { Label } from '@wyze/ui/label'
import * as React from 'react'
import {
  Form,
  Link,
  Outlet,
  redirect,
  UNSAFE_DataRouterStateContext,
} from 'react-router'

import { auth } from '~/.server/auth'
import { usePathSegment } from '~/hooks/use-path-segment'
import type { Result } from '~/types'

import type { Route } from './+types/route'

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (session) {
    return redirect('/')
  }

  return { ok: true }
}

function useRouteActionData<T>(routeId: string): T | undefined {
  const context = React.useContext(UNSAFE_DataRouterStateContext)

  if (!context) {
    throw new Error('Unable to use data router state context')
  }

  return context.actionData?.[routeId]
}

export default function AuthRoute() {
  const emailId = React.useId()
  const passwordId = React.useId()
  const [type, setType] = React.useState<'password' | 'text'>('password')

  const segment = usePathSegment(0)
  const actionData = useRouteActionData<Result<null, string>>(
    `modules/auth/${segment}`,
  )

  const isSignin = segment === 'sign-in'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 md:p-10">
      <Link
        className="absolute top-6 left-10 inline-flex items-center font-medium text-gray-600 transition-colors hover:text-gray-900"
        to="/"
      >
        <Icon className="size-6" name="chevron-left" />
        Home
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {isSignin ? 'Welcome back' : 'Create account'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <Form action={segment} className="grid gap-6" method="post">
                  {actionData?.ok === false ? (
                    <Alert variant="danger">
                      <AlertTitle>{actionData.value}</AlertTitle>
                    </Alert>
                  ) : null}

                  <div className="grid gap-3">
                    <Label htmlFor={emailId}>Email</Label>
                    <Input
                      id={emailId}
                      name="email"
                      placeholder="me@example.com"
                      required
                      type="email"
                    />
                  </div>
                  <div className="grid gap-3">
                    <div className="flex items-center">
                      <Label htmlFor={passwordId}>Password</Label>
                    </div>
                    <Input
                      id={passwordId}
                      name="password"
                      placeholder="••••••••••••"
                      trailingIcon={
                        <Button
                          className="size-6 p-0.5 text-muted-foreground"
                          onClick={() =>
                            setType((state) =>
                              state === 'text' ? 'password' : 'text',
                            )
                          }
                          render={
                            <Icon name={type === 'text' ? 'eye-off' : 'eye'} />
                          }
                          variant="ghost"
                        />
                      }
                      type={type}
                      required
                    />
                  </div>
                  <Outlet />
                </Form>
                <div className="text-center text-sm">
                  {isSignin ? "Don't" : 'Already'} have an account?{' '}
                  <Link
                    to={isSignin ? 'sign-up' : 'sign-in'}
                    className="underline underline-offset-4"
                  >
                    Sign {isSignin ? 'up' : 'in'}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-muted-foreground text-xs *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
            By clicking continue, you agree to our{' '}
            <Link to="/terms-of-service">Terms of Service</Link> and{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  )
}
