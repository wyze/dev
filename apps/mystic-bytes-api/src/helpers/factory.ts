import { createFactory } from 'hono/factory'

type Env = {
  Bindings: Cloudflare.Env
}

export const factory = createFactory<Env>()
