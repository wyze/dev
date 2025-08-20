import { defineConfig, devices } from '@playwright/test'

const isCi = typeof process.env.CI !== 'undefined'
const port = isCi ? 4173 : 5173

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isCi
    ? {
        command: 'pnpm preview',
        cwd: '../../apps/lists',
        url: 'http://localhost:4173',
      }
    : undefined,
})
