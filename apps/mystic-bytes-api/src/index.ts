import { Scalar } from '@scalar/hono-api-reference'
import { requestId } from 'hono/request-id'
import { openAPIRouteHandler } from 'hono-openapi'

import { factory } from '@/helpers/factory'
import * as account from '@/modules/account/routes'
import { auth, session } from '@/modules/auth/middleware'
import * as home from '@/modules/home/routes'
import { database } from '@/modules/middleware/database'
import { logger } from '@/modules/middleware/logger'

const app = factory
  .createApp()

  // Setup middlewares
  .use(requestId())
  .use(logger())
  .use(database())
  .use(auth())
  .use(session({ public: ['/', '/account', '/docs', '/openapi.json'] }))

  // Setup error handling
  .onError((error, c) => {
    console.error(error)

    if (c.env.ENV === 'development') {
      const { message, stack, ...rest } = error

      return c.json({ message, stack, ...rest }, 500)
    }

    return c.text('Internal Server Error', 500)
  })

  // Setup auth routes
  .on(['POST', 'GET'], '/api/auth/*', (c) => c.get('auth').handler(c.req.raw))

  // Setup game routes
  .route('/', home.routes)
  .route('/', account.routes)

  // Setup OpenAPI routes
  .get(
    '/openapi.json',
    openAPIRouteHandler(factory.createApp().route('/', account.routes), {
      documentation: {
        info: {
          title: 'Mystic Bytes',
          version: '1.0.0',
          description: 'API for Mystic Bytes',
          license: { name: 'MIT' },
        },
        components: {
          securitySchemes: {
            ApiKeyAuth: {
              type: 'apiKey',
              in: 'header',
              name: 'x-api-key',
              description: 'API key issued when you registered an account',
            },
          },
        },
      },
    }),
  )
  .get(
    '/docs',
    Scalar({
      url: '/openapi.json',
      defaultHttpClient: {
        clientKey: 'fetch',
        targetKey: 'node',
      },
    }),
  )

export default app
