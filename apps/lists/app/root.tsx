import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'
import { Toaster } from '@wyze/ui/sonner'
import * as React from 'react'
import {
  data,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from 'react-router'
import { toast } from 'sonner'
import '@wyze/ui/globals.css'

import { getToast } from '~/.server/toast'
import logo from '~/assets/logo.png'

import type { Route } from './+types/root'

export async function loader(args: Route.LoaderArgs) {
  const { headers, toast } = await getToast(args)

  return data({ toast }, { headers })
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

export function Layout({ children }: { children: React.ReactNode }) {
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
          <header className="sticky top-0 border-gray-200 border-b bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto max-w-4xl">
              <Link to="/">
                <h1 className="flex items-center gap-1 font-bold text-2xl text-gray-900 dark:text-gray-50">
                  <img alt="Lists" className="size-6" src={logo} />
                  Lists
                </h1>
              </Link>
            </div>
          </header>
          <main className="min-h-[calc(100vh-7.6rem)]">{children}</main>
          <footer className="flex items-center justify-center gap-6 px-6 py-4 font-medium text-gray-700 text-sm opacity-50 transition-opacity hover:opacity-100">
            <Link to="/legal/terms-of-service">Terms of Service</Link>
            <Link to="/legal/privacy-policy">Privacy Policy</Link>
          </footer>
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
