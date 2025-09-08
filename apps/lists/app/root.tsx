import { Icon } from '@wyze/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@wyze/ui/avatar'
import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@wyze/ui/dropdown-menu'
import { Toaster } from '@wyze/ui/sonner'
import * as React from 'react'
import {
  data,
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  redirect,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from 'react-router'
import { toast } from 'sonner'
import * as v from 'valibot'
import '@wyze/ui/globals.css'

import { auth } from '~/.server/auth'
import { getToast } from '~/.server/toast'
import logoLocal from '~/assets/logo.local.png'
import logoProd from '~/assets/logo.png'
import { usePathSegment } from '~/hooks/use-path-segment'

import type { Route } from './+types/root'

const logo = import.meta.env.PROD ? logoProd : logoLocal

const FormSchema = v.object({
  intent: v.literal('logout'),
})

export async function action({ request }: Route.ActionArgs) {
  const form = v.parse(
    FormSchema,
    Object.fromEntries((await request.formData()).entries()),
  )

  switch (form.intent) {
    case 'logout': {
      const { headers } = await auth.api.signOut({
        headers: request.headers,
        returnHeaders: true,
      })

      return redirect('/sign-in', { headers })
    }
  }
}

export async function loader(args: Route.LoaderArgs) {
  const [{ headers, toast }, session] = await Promise.all([
    getToast(args),
    auth.api.getSession({ headers: args.request.headers }),
  ])

  return data({ toast, user: session?.user ?? null }, { headers })
}

function useToast() {
  const input = useLoaderData<typeof loader>()

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!input?.toast) {
        return
      }

      const { title, type, ...extra } = input.toast
      const show = toast[type]

      show(title, extra)
    })

    return () => {
      clearTimeout(timeout)
    }
  }, [input])
}

function UserMenu() {
  const { user } = useLoaderData<typeof loader>()

  // We will have a user here, but TypeScript doesn't know it
  if (!user) {
    return null
  }

  const initials = user.name
    .split(' ')
    .map(([letter]) => letter.toUpperCase())
    .join('')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" className="relative size-8 rounded-full" />
        }
      >
        <span className="sr-only">User menu</span>
        <Avatar className="size-8">
          <AvatarImage
            src={user.image ?? undefined}
            alt={user.name ?? 'User'}
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm leading-none">{user.name}</p>
              <p className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground text-xs leading-none">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        {user.isAnonymous ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/sign-up" />}>
              <Icon className="mr-2 size-4" name="users" />
              <span>Sign up</span>
            </DropdownMenuItem>
          </>
        ) : null}
        <DropdownMenuSeparator />
        <Form method="post">
          <DropdownMenuItem
            render={
              <Button
                className="w-full justify-start"
                name="intent"
                value="logout"
                type="submit"
                variant="ghost"
              />
            }
          >
            <Icon className="mr-2 size-4" name="log-out" />
            <span>Log out</span>
          </DropdownMenuItem>
        </Form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useLoaderData<typeof loader>()
  const segment = usePathSegment(0)
  const isAuthRoute = segment?.startsWith('sign-') ?? false

  useToast()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
        />
        <link rel="icon" type="image/png" href={logo} />
        <Meta />
        <Links />
      </head>
      <body className="root">
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
          {isAuthRoute ? null : (
            <header className="sticky top-0 border-gray-200 border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
              <div className="mx-auto flex max-w-4xl items-center justify-between">
                <Link to="/">
                  <h1 className="flex items-center gap-1 font-bold text-2xl text-gray-900 dark:text-gray-50">
                    <img alt="Lists" className="size-6" src={logo} />
                    Lists
                  </h1>
                </Link>
                {user ? (
                  <UserMenu />
                ) : (
                  <Button
                    render={<Link to="/sign-in" />}
                    size="sm"
                    variant="outline"
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </header>
          )}
          <main
            className={
              isAuthRoute
                ? 'mx-auto flex min-h-screen items-center'
                : 'min-h-[calc(100vh-7.6rem)]'
            }
          >
            {children}
          </main>
          {isAuthRoute ? null : (
            <footer className="flex items-center justify-center gap-6 px-6 py-4 font-medium text-gray-700 text-sm opacity-50 transition-opacity hover:opacity-100">
              <Link to="/legal/acceptable-use">Acceptable Use</Link>
              <Link to="/legal/privacy-policy">Privacy Policy</Link>
              <Link to="/legal/terms-of-service">Terms of Service</Link>
            </footer>
          )}
          <Toaster richColors />
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const { pathname } = useLocation()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <title>List Not Found :: Lists</title>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6">
              <Icon
                className="size-16 text-muted-foreground"
                name="file-error"
              />
            </div>

            <h1 className="mb-2 font-semibold text-2xl">List Not Found</h1>

            <p className="mb-6 text-muted-foreground leading-relaxed">
              The list you're looking for might have been moved, deleted, or
              never existed.
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                render={
                  <Link to="/">
                    <Icon className="mr-2 size-4" name="home" />
                    Go Home
                  </Link>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <title>Server Error :: Lists</title>
      <Card className="fade-in-50 slide-in-from-bottom-4 mx-auto w-full max-w-md animate-in duration-500">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <span className="font-bold text-3xl text-destructive">500</span>
          </div>
          <CardTitle className="font-semibold text-2xl">Server Error</CardTitle>
          <CardDescription className="text-muted-foreground">
            Our servers are having trouble processing your lists right now.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 gap-2"
              render={
                <Link to={pathname} reloadDocument>
                  <Icon className="size-4" name="refresh-3" />
                  Retry
                </Link>
              }
            />

            <Button
              className="flex-1 gap-2"
              render={
                <Link to="/">
                  <Icon className="size-4" name="home" />
                  Home
                </Link>
              }
              variant="outline"
            />
          </div>

          <p className="text-center text-muted-foreground text-xs">
            If this persists, please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
