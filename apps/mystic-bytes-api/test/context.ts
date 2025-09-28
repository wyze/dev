import { type } from 'arktype'
import type { ClientRequestOptions } from 'hono'
import { testClient } from 'hono/testing'
import { test as baseTest } from 'vitest'

import { env } from 'cloudflare:test'
import app from '../src'

const client = testClient(app, env)

const ApiKey = type({
  key: 'string',
})

export const test = baseTest.extend<{
  apikey: string
  client: typeof client
  options: ClientRequestOptions
}>({
  async apikey({ client }, use) {
    const response = await client.account.$post({
      json: {
        email: 'mystic-bytes@example.com',
        name: 'Me',
        password: crypto.randomUUID(),
      },
    })

    const json = ApiKey(await response.json())

    if (json instanceof type.errors) {
      throw json
    }

    await use(json.key)
  },
  // biome-ignore lint/correctness/noEmptyPattern: Vitest requires empty object
  async client({}, use) {
    await use(client)
  },
  async options({ apikey }, use) {
    await use({ headers: { 'x-api-key': apikey } })
  },
})

export { test as it }
