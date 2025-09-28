import { pinoLogger } from 'hono-pino'
import type { Logger } from 'pino'

import { env } from 'cloudflare:workers'

type LoggerVariables = {
  logger: Logger
}

declare module 'hono' {
  interface ContextVariableMap extends LoggerVariables {}
}

export function logger() {
  return pinoLogger({
    pino: {
      enabled: env.MODE !== 'test',
      level: 'info',
      transport:
        env.ENV === 'development'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
    },
  })
}
