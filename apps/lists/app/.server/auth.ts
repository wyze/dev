import { type BetterAuthOptions, betterAuth } from 'better-auth'
import { anonymous } from 'better-auth/plugins'
import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import { defaultDeserializer, SerializePlugin } from 'kysely-plugin-serialize'
import { v7 as uuidv7 } from 'uuid'

const config = {
  account: {
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
  plugins: [
    anonymous({
      schema: { user: { fields: { isAnonymous: 'is_anonymous' } } },
    }),
  ],
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

export function createAuth(dialect: Dialect): typeof auth {
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
      ...config,
    } satisfies BetterAuthOptions)
  }

  return auth
}
