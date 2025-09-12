import { test as base, expect } from '@playwright/test'

import { ListsPage } from './fixtures/lists-page'
import { randomUUID } from 'node:crypto'

const test = base.extend<{ listsPage: ListsPage }>({
  listsPage: async ({ page }, use) => {
    const listsPage = new ListsPage(page)

    await listsPage.first()
    await use(listsPage)
  },
})

test('has title', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('Lists')
})

test('has acceptable use page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Acceptable Use').click()
  await expect(page).toHaveTitle('Acceptable Use · Lists')
  await expect(page.getByText('Last updated: 2025-08-31')).toBeVisible()
})

test('has privacy policy page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Privacy Policy').click()
  await expect(page).toHaveTitle('Privacy Policy · Lists')
  await expect(page.getByText('Effective Date: 2025-08-31')).toBeVisible()
})

test('has terms of service page', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Terms of Service').click()
  await expect(page).toHaveTitle('Terms of Service · Lists')
  await expect(page.getByText('Effective Date: 2025-08-31')).toBeVisible()
})

test('shows empty space when no lists present', async ({ listsPage, page }) => {
  await expect(page).toHaveTitle(`${listsPage.title} · Lists`)
  await expect(page.getByText(listsPage.title)).toBeVisible()
  await expect(page.getByText('1 item')).toBeVisible()
  await expect(page.getByText('First item.')).toBeVisible()
})

test('able to edit title of existing list', async ({ listsPage, page }) => {
  await expect(page.getByText(listsPage.title)).toBeVisible()
  await expect(page.locator('[rel=canonical]')).toHaveAttribute(
    'href',
    page.url(),
  )

  await page.getByRole('button', { name: 'Edit title' }).click()
  await page.getByPlaceholder('Enter a title...').fill('My test title')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(
    page.getByText('Title of this list has been updated.'),
  ).toBeVisible()

  await expect(page.locator('[rel=canonical]')).toHaveAttribute(
    'href',
    page.url(),
  )
  await expect(page.getByText('My test title')).toBeVisible()
})

test('able to edit entry of existing list', async ({ listsPage: _, page }) => {
  await page.getByRole('button', { name: 'Edit item' }).click()
  await page
    .getByPlaceholder('What would you like to do?')
    .fill('I have been edited.')

  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText('The list entry was updated.')).toBeVisible()
  await expect(page.getByText('I have been edited.')).toBeVisible()
})

test('ensure we can only edit one item at a time', async ({
  listsPage,
  page,
}) => {
  await listsPage.add('New item.')
  await page.getByRole('button', { name: 'Edit item' }).first().click()

  const input = page.getByPlaceholder('What would you like to do?')
  await expect(input).toHaveCount(1)
})

test('able to add a new item to a list', async ({ listsPage, page }) => {
  await listsPage.add('New item.')
  await expect(page.getByText('2 items')).toBeVisible()
  await expect(page.getByText('New item.')).toBeVisible()
  await expect(page.getByPlaceholder('Add new item...')).toBeEmpty()
})

test('able to delete an item from a list', async ({ listsPage, page }) => {
  await listsPage.add('New item.')
  await page.getByRole('button', { name: 'Delete item' }).first().click()
  await expect(
    page.getByText('The item has been removed from the list.'),
  ).toBeVisible()

  await expect(page.getByText('1 item')).toBeVisible()
  await expect(page.getByText('First item.')).not.toBeVisible()
})

test('able to reorder items in the list', async ({ listsPage, page }) => {
  await listsPage.add('New item.')

  const first = await page.getByText('First item.').boundingBox()
  const second = await page.getByText('New item.').boundingBox()

  if (!first || !second) {
    return
  }

  // Built in drag and drop functions did not work
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    second.x + second.width / 2,
    second.y + second.height / 2,
    { steps: 20 },
  )
  await page.mouse.up()
  await expect(
    page.getByText('The items have been reordered in the list.'),
  ).toBeVisible()

  await expect(page.getByRole('listitem')).toHaveText([
    /New item/,
    /First item/,
  ])
})

test('able to switch list type to todo', async ({ listsPage, page }) => {
  await listsPage.changeType('Todo')
  await expect(
    page.getByText('The type of list has been changed.'),
  ).toBeVisible()
  await expect(page.getByText('0 of 1 completed')).toBeVisible()
})

test('able to toggle list item completion', async ({ listsPage, page }) => {
  await listsPage.changeType('Todo')
  const checkbox = page.getByRole('checkbox')
  await expect(checkbox).toHaveAttribute('aria-checked', 'false')
  await checkbox.click()
  await expect(checkbox).toHaveAttribute('aria-checked', 'true')
  await expect(page.getByText('1 of 1 completed')).toBeVisible()
  await listsPage.changeType('Basic')
  await expect(page.getByText('1 item')).toBeVisible()
  await listsPage.changeType('Todo')
  await checkbox.click()
  await expect(checkbox).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByText('0 of 1 completed')).toBeVisible()
})

test('able to migrate anonymous user to real user', async ({
  listsPage,
  page,
}) => {
  const id = randomUUID()
  const password = randomUUID()
  const url = page.url()

  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByText('Sign up').click()
  await page.getByPlaceholder('me@example.com').fill(`${id}@example.com`)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  await page.goto(url)
  await expect(page).toHaveTitle(`${listsPage.title} · Lists`)
  await expect(page.getByText(listsPage.title)).toBeVisible()
})

test.describe('Shopping list has additional fields', () => {
  test.beforeEach(async ({ listsPage, page }) => {
    await listsPage.changeType('Shopping')
    await page.getByRole('button', { name: 'Edit item' }).click()
  })

  test('Can change the quantity', async ({ listsPage: _, page }) => {
    await page.getByRole('textbox', { name: 'Quantity' }).fill('4')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('The list entry was updated.')).toBeVisible()
    await expect(page.getByRole('main').getByText('4')).toBeVisible()
  })

  test('Can change the price', async ({ listsPage: _, page }) => {
    await page.getByRole('textbox', { name: 'Price' }).fill('15.4')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('The list entry was updated.')).toBeVisible()
    await expect(page.getByRole('main').getByText('15.40')).toBeVisible()
  })

  test('Can change the category', async ({ listsPage: _, page }) => {
    await page.getByRole('combobox', { name: 'Category' }).click()
    await page.getByRole('option', { name: 'Meat' }).click()
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByText('The list entry was updated.')).toBeVisible()
    await expect(page.getByRole('main').getByText('Meat')).toBeVisible()
  })
})
