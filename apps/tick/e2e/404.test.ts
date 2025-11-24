import { expect, test } from '@playwright/test'

test('has message when page not found', async ({ page }) => {
  await page.goto('/404')

  await expect(page.getByText('Countdown Not Found')).toBeVisible()
})
