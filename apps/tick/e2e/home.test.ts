import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Tick')
})

test('has an alert', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('We are under construction')).toBeVisible()
})
