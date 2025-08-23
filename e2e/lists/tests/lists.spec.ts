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

test('able to edit title of existing list', async ({ page }) => {
  await page.goto('/')

  await page
    .getByPlaceholder('What do you want to add?')
    .fill('Edit my list title.')

  await page.getByRole('button', { name: 'Add Item' }).click()

  await page.waitForURL('/lists/*')

  const title = `${await page.locator('[data-slot=card-title]').textContent()}`

  await expect(page.getByText(title)).toBeVisible()

  await page.getByRole('button', { name: 'Edit title' }).click()

  await page.getByPlaceholder('Enter a title...').fill('My test title')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByText('Title of this list has been updated.'),
  ).toBeVisible()

  await expect(page.getByText('My test title')).toBeVisible()
})

test('able to edit entry of existing list', async ({ page }) => {
  await page.goto('/')

  await page.getByPlaceholder('What do you want to add?').fill('Edit me.')

  await page.getByRole('button', { name: 'Add Item' }).click()

  await page.waitForURL('/lists/*')

  await page.getByRole('button', { name: 'Edit item' }).click()

  await page
    .getByPlaceholder('What would you like to do?')
    .fill('I have been edited.')

  await page.getByRole('button', { name: 'Save' }).click()

  await expect(
    page.getByText('The list entry label was updated.'),
  ).toBeVisible()

  await expect(page.getByText('I have been edited.')).toBeVisible()
})

test('able to add a new item to a list', async ({ page }) => {
  await page.goto('/')

  await page.getByPlaceholder('What do you want to add?').fill('Test item add.')

  await page.getByRole('button', { name: 'Add Item' }).click()

  await page.waitForURL('/lists/*')

  await page.getByPlaceholder('Add new item...').fill('New item.')

  await page.getByRole('button', { name: 'Add item' }).click()

  await expect(
    page.getByText('The item has been added to the list.'),
  ).toBeVisible()

  await expect(page.getByText('2 items')).toBeVisible()
  await expect(page.getByText('New item.')).toBeVisible()
  await expect(page.getByPlaceholder('Add new item...')).toBeEmpty()
})
