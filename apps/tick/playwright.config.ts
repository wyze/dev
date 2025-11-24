import { defineConfig, devices } from '@playwright/test'

import { worker } from './alchemy.run'

export default defineConfig(
  {
    testDir: './e2e',
    fullyParallel: true,
    use: {
      baseURL: worker.url,
      trace: 'on-first-retry',
    },
    projects: [
      {
        name: 'chromium',
        use: { ...devices['Desktop Chrome'] },
      },
    ],
    webServer: {
      command: 'pnpm alchemy run',
      url: worker.url,
      reuseExistingServer: true,
    },
  },
  process.env.CI
    ? { forbidOnly: true, reporter: 'github', retries: 2, workers: 1 }
    : {}
)
