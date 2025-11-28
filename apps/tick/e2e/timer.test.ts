import { expect, test } from '@playwright/test'

test('has countdown information', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('textbox', { name: 'Name' }).fill('Timer test')
  await page.getByRole('button', { name: 'Create' }).click()

  await expect(page).toHaveTitle('Timer test :: Tick')
  await expect(page.getByText('Timer test')).toBeVisible()
  await expect(page.getByText(page.url())).toBeVisible()
  // biome-ignore lint/performance/useTopLevelRegex: Only called once
  await expect(page.getByText(/00:\d{2}:\d{2}/)).toBeVisible()
  await expect(page.getByText('Time remaining')).toBeVisible()
})

test('generates label from target', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Create' }).click()

  const label = await page
    // biome-ignore lint/performance/useTopLevelRegex: Only called once
    .getByText(/Today at \d{1,2}:\d{1,2} [AP]M/)
    .textContent()

  await expect(page.getByText(label ?? 'not found')).toBeVisible()
  await expect(page).toHaveTitle(`${label} :: Tick`)
})
