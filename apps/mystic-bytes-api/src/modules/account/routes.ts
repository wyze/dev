import { type } from 'arktype'
import { describeRoute, validator } from 'hono-openapi'

import { factory } from '@/helpers/factory'
import * as responses from '@/helpers/response'

const tags = ['Account']

const Key = type({ name: 'string | null' })

const Account = type({
  createdAt: 'string.date.iso',
  email: 'string.email',
  id: 'string',
  key: Key,
}).configure({ description: 'An account for a user', ref: 'AccountSchema' })

const NewAccountPayload = type({
  name: 'string > 0',
  email: 'string.email',
  password: 'string > 7',
}).configure({
  description: 'Payload sent to create a new account',
  ref: 'NewAccountPayloadSchema',
})

export const routes = factory
  .createApp()
  .basePath('/account')
  .post(
    '/',
    describeRoute({
      summary: 'Create an account',
      description: 'Create an account to play the game',
      responses: {
        ...responses.ok(type({ key: 'string' })),
        ...responses.badRequest(
          type({
            success: 'false',
            data: NewAccountPayload.partial(),
            error: 'string[]',
          }),
        ),
        ...responses.serverError(),
      },
      tags,
    }),
    validator('json', NewAccountPayload, (result, c) => {
      if (!result.success && result.error instanceof type.errors) {
        return c.json(
          {
            success: false,
            data: result.data,
            error: result.error.summary.split('\n'),
          },
          400,
        )
      }
    }),
    async (c) => {
      const auth = c.get('auth')
      const body = c.req.valid('json')
      const acct = await auth.api.signUpEmail({ body })
      const { key } = await auth.api.createApiKey({
        body: { userId: acct.user.id, name: 'For the game' },
      })

      return c.json({ key }, 200)
    },
  )
  .get(
    '/me',
    describeRoute({
      summary: 'Get my account',
      description: 'Get some details about my account',
      responses: {
        ...responses.ok(Account),
        ...responses.unauthorized(),
        ...responses.forbidden(),
      },
      security: [{ ApiKeyAuth: [] }],
      tags,
    }),
    async (c) => {
      const { createdAt, email, id } = c.get('user')

      return c.json({ createdAt, email, id }, 200)
    },
  )
