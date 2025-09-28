import {
  defineWorkersProject,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers/config'
import { hono } from '@wyze/vite-config'

import path from 'node:path'

export default defineWorkersProject(async () => {
  const migrations = await readD1Migrations(path.join(__dirname, 'db'))

  return {
    ...hono(),
    test: {
      poolOptions: {
        workers: {
          miniflare: {
            bindings: {
              MODE: 'test',
              TEST_MIGRATIONS: migrations,
            },
          },
          wrangler: { configPath: './wrangler.jsonc' },
        },
      },
      setupFiles: ['./test/apply-migrations.ts'],
    },
  }
})
