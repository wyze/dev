import { type BetterAuthOptions, betterAuth } from 'better-auth'
import { apiKey } from 'better-auth/plugins'
import type { Dialect } from 'kysely'
import { Kysely } from 'kysely'
import { SerializePlugin } from 'kysely-plugin-serialize'

const options = {
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
  emailAndPassword: { enabled: true },
  plugins: [
    apiKey({
      schema: {
        apikey: {
          fields: {
            createdAt: 'created_at',
            expiresAt: 'expires_at',
            lastRefillAt: 'last_refill_at',
            lastRequest: 'last_request',
            rateLimitEnabled: 'rate_limit_enabled',
            rateLimitMax: 'rate_limit_max',
            rateLimitTimeWindow: 'rate_limit_time_window',
            refillAmount: 'refill_amount',
            refillInterval: 'refill_interval',
            requestCount: 'request_count',
            updatedAt: 'updated_at',
            userId: 'user_id',
          },
        },
      },
    }),
  ],
  session: {
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

export function createAuth(dialect: Dialect) {
  return betterAuth({
    ...options,
    database: {
      db: new Kysely({ dialect, plugins: [new SerializePlugin()] }),
      type: 'sqlite',
    },
  })
}
