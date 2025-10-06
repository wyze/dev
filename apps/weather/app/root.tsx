import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from 'react-router'

import type { Route } from './+types/root'
import '@wyze/ui/globals.css'
import { Icon } from '@wyze/icons'
import { Button } from '@wyze/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/card'

import logoLocal from '~/assets/logo.local.png'
import logoProd from '~/assets/logo.png'

const logo = import.meta.env.PROD ? logoProd : logoLocal

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <title>Weather</title>
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
      </head>
      <body className="root">
        {children}
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
        <title>List Not Found · Weather</title>
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
      <title>Server Error · Weather</title>
      <Card className="fade-in-50 slide-in-from-bottom-4 mx-auto w-full max-w-md animate-in duration-500">
        <CardHeader className="pb-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <span className="font-bold text-3xl text-destructive">500</span>
          </div>
          <CardTitle className="font-semibold text-2xl">Server Error</CardTitle>
          <CardDescription className="text-muted-foreground">
            Our servers are having trouble processing the weather right now.
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
