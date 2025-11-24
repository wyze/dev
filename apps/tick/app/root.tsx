import { Button } from '@wyze/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@wyze/ui/components/card'
import { FileExclamationPointIcon, HomeIcon, RotateCwIcon } from 'lucide-react'
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
import '@wyze/ui/globals.css'

import type { Route } from './+types/root'

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <link href="/tick.png" rel="icon" type="image/png" />
        <Meta />
        <Links />
      </head>
      <body>
        <main className="h-screen">{children}</main>
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
        <title>Countdown Not Found :: Tick</title>
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center p-8 text-center">
            <div className="mb-6">
              <FileExclamationPointIcon className="size-16 text-muted-foreground" />
            </div>

            <h1 className="mb-2 font-semibold text-2xl">Countdown Not Found</h1>

            <p className="mb-6 text-muted-foreground leading-relaxed">
              The countdown you're looking for might have been moved, deleted,
              or never existed.
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                render={
                  <Link to="/">
                    <HomeIcon className="size-4" />
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
      <title>Server Error :: Tick</title>
      <Card className="fade-in-50 slide-in-from-bottom-4 mx-auto w-full max-w-md animate-in duration-500">
        <CardHeader className="flex flex-col py-6 text-center">
          <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <span className="font-bold text-3xl text-destructive">500</span>
          </div>
          <CardTitle className="font-semibold text-2xl">Server Error</CardTitle>
          <CardDescription className="text-muted-foreground">
            Our servers are having trouble processing your countdowns right now.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex-1 gap-2"
              nativeButton={false}
              render={
                <Link reloadDocument to={pathname}>
                  <RotateCwIcon className="size-4" />
                  Retry
                </Link>
              }
            />

            <Button
              className="flex-1 gap-2"
              nativeButton={false}
              render={
                <Link to="/">
                  <HomeIcon className="size-4" />
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
