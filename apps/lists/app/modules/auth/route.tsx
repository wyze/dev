import { Icon } from '@wyze/icons'
import { Link, Outlet, redirect } from 'react-router'

import { auth } from '~/.server/auth'
import type { Result } from '~/types'

import type { Route } from './+types/route'

export async function loader({
  request,
}: Route.LoaderArgs): Promise<
  Response | Result<{ anonymous: boolean }, string>
> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (session && !session.user.isAnonymous) {
    return redirect('/')
  }

  const error = new URL(request.url).searchParams.get('error') ?? null

  switch (error) {
    case null:
      return {
        ok: true,
        value: { anonymous: session?.user.isAnonymous ?? false },
      }
    case 'signup_disabled':
      return { ok: false, value: 'Sign up is disabled on the sign in page.' }
    default:
      return { ok: false, value: error }
  }
}

export default function AuthRoute() {
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
          <Outlet />
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
