import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Tick')
})

test('can create a countdown', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Name' }).fill('Test countdown')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page.getByText('Soon')).toBeVisible()
})
