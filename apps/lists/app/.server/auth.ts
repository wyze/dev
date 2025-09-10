import {
  APIError,
  type BetterAuthOptions,
  type BetterAuthPlugin,
  betterAuth,
} from 'better-auth'
import { anonymous, createAuthMiddleware } from 'better-auth/plugins'
import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import { defaultDeserializer, SerializePlugin } from 'kysely-plugin-serialize'
import { v7 as uuidv7 } from 'uuid'
import type { Env } from 'workers/app'

import { sendResetPassword } from '~/modules/auth/helpers/send-password-reset'
import { migrate } from '~/modules/list/helpers/migrate'

const removeTestData = () =>
  ({
    id: 'removeTestData',
    hooks: {
      before: [
        {
          matcher: () => true,
          handler: createAuthMiddleware(async (ctx) => {
            const user = await ctx.context.internalAdapter.findUserByEmail(
              `${process.env.GOOGLE_AUTH_EMAIL}`,
            )

            if (user) {
              await ctx.context.internalAdapter.deleteUser(user.user.id)
            }

            return { context: ctx }
          }),
        },
      ],
    },
  }) satisfies BetterAuthPlugin

const config = {
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['github', 'google'],
      updateUserInfoOnLink: true,
    },
    fields: {
      accessToken: 'access_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      accountId: 'account_id',
      createdAt: 'created_at',
      idToken: 'id_token',
      providerId: 'provider_id',
      refreshToken: 'refresh_token',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
    },
  },
  advanced: {
    database: {
      generateId: () => uuidv7(),
    },
    ipAddress: { ipAddressHeaders: ['cf-connecting-ip'] },
  },
  databaseHooks: {
    account: {
      update: {
        async before(data, ctx) {
          const id = `reset-password:${ctx?.body.token}`
          const verification =
            await ctx?.context.internalAdapter.findVerificationValue(id)

          if (!verification) {
            throw new APIError('BAD_REQUEST', {
              message: 'Unable to find verification record',
            })
          }

          const accounts = await ctx?.context.internalAdapter.findAccounts(
            verification.value,
          )
          const account = accounts?.find(
            (account) => account.providerId === 'credential',
          )

          if (!account) {
            throw new APIError('BAD_REQUEST', {
              message: 'Unable to find account record',
            })
          }

          const compare = await ctx?.context.password.verify({
            hash: account.password ?? '',
            password: ctx.body.newPassword,
          })

          if (compare) {
            throw new APIError('BAD_REQUEST', {
              message: 'Password matches previous password',
            })
          }

          return { data }
        },
      },
    },
    user: {
      create: {
        async before(user) {
          const username = user.email.endsWith('@null')
            ? user.email.slice(5, -5)
            : user.email.split('@').at(0)

          return { data: { ...user, username } }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    revokeSessionsOnPasswordReset: true,
  },
  plugins: [anonymous(), ...(import.meta.env.PROD ? [] : [removeTestData()])],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 15 * 60, // Cache duration in seconds (15 minutes)
    },
    fields: {
      createdAt: 'created_at',
      expiresAt: 'expires_at',
      ipAddress: 'ip_address',
      updatedAt: 'updated_at',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
  },
  user: {
    additionalFields: {
      username: {
        required: true,
        type: 'string',
        unique: true,
      },
    },
    fields: {
      createdAt: 'created_at',
      emailVerified: 'email_verified',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    fields: {
      createdAt: 'created_at',
      expiresAt: 'expires_at',
      updatedAt: 'updated_at',
    },
  },
} satisfies BetterAuthOptions

export let auth: ReturnType<typeof betterAuth<typeof config>>

export function createAuth(env: Env, dialect: Dialect): typeof auth {
  if (!auth) {
    auth = betterAuth({
      database: {
        db: new Kysely({
          dialect,
          plugins: [
            new SerializePlugin({
              deserializer(param) {
                const value = defaultDeserializer(param)

                switch (true) {
                  case value instanceof Date:
                    return value
                  case typeof value === 'object' && Boolean(value):
                    return JSON.stringify(value)
                  default:
                    return value
                }
              },
            }),
          ],
        }),
        type: 'sqlite',
      },
      socialProviders: {
        github: {
          clientId: env.GITHUB_CLIENT_ID,
          clientSecret: env.GITHUB_CLIENT_SECRET,
          disableImplicitSignUp: true,
          enabled: true,
          overrideUserInfoOnSignIn: true,
        },
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          disableImplicitSignUp: true,
          enabled: true,
          overrideUserInfoOnSignIn: true,
        },
      },
      ...config,
      emailAndPassword: {
        ...config.emailAndPassword,
        async sendResetPassword({ user, url }) {
          if (env.RESEND_API_KEY === 're_test') {
            return
          }

          const response = await sendResetPassword(env, { user, url })

          if (response.error) {
            throw response.error
          }
        },
      },
      plugins: [
        anonymous({
          emailDomainName: 'lists.wyze.dev',
          async onLinkAccount({ anonymousUser, newUser }) {
            await migrate(env, anonymousUser.user, newUser.user)
          },
          schema: { user: { fields: { isAnonymous: 'is_anonymous' } } },
        }),
        ...(import.meta.env.PROD ? [] : [removeTestData()]),
      ],
    } satisfies BetterAuthOptions)
  }

  return auth
}
