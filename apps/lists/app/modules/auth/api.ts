import { auth } from '~/.server/auth'

import type { Route } from './+types/api'

export function action({ request }: Route.ActionArgs) {
  return auth.handler(request)
}

export function loader({ request }: Route.LoaderArgs) {
  return auth.handler(request)
}
