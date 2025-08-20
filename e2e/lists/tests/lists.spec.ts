import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Lists')
})

test('shows empty space when no lists present', async ({ page }) => {
  await page.goto('/')

  await page
    .getByPlaceholder('What do you want to add?')
    .fill('Write more tests.')

  await page.getByRole('button', { name: 'Add Item' }).click()

  await page.waitForURL('/lists/*')

  const title = `${await page.locator('[data-slot=card-title]').textContent()}`

  await expect(page).toHaveTitle(`${title} :: Lists`)
  await expect(page.getByText(title)).toBeVisible()
  await expect(page.getByText('1 item')).toBeVisible()
  await expect(page.getByText('Write more tests.')).toBeVisible()
})
