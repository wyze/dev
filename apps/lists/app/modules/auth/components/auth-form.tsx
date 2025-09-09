import { Alert, AlertTitle } from '@wyze/ui/alert'
import * as React from 'react'
import {
  Form,
  UNSAFE_DataRouterStateContext,
  useRouteLoaderData,
} from 'react-router'

import type { Result } from '~/types'

import { useAuthAction } from '../hooks/use-auth-action'

function useRouteActionData<T>(routeId: string): T | undefined {
  const context = React.useContext(UNSAFE_DataRouterStateContext)

  if (!context) {
    throw new Error('Unable to use data router state context')
  }

  return context.actionData?.[routeId]
}

export function AuthForm({ children }: { children: React.ReactNode }) {
  const { pathname, segment } = useAuthAction()
  const actionData = useRouteActionData<Result<null, string>>(
    `modules/auth/${segment}`,
  )
  const loaderData =
    useRouteLoaderData<Result<{ anonymous: boolean }, string>>(
      'modules/auth/route',
    )

  return (
    <Form action={pathname} className="grid gap-6" method="post">
      {actionData?.ok === false ? (
        <Alert variant="danger">
          <AlertTitle>{actionData.value}</AlertTitle>
        </Alert>
      ) : loaderData && !loaderData.ok ? (
        <Alert variant="danger">
          <AlertTitle>{loaderData.value}</AlertTitle>
        </Alert>
      ) : null}
      {children}
    </Form>
  )
}
