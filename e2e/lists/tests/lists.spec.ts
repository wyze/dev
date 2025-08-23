import { test as base, expect } from '@playwright/test'

import { ListsPage } from './lists-page'

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

test('shows empty space when no lists present', async ({ listsPage, page }) => {
  await expect(page).toHaveTitle(`${listsPage.title} :: Lists`)
  await expect(page.getByText(listsPage.title)).toBeVisible()
  await expect(page.getByText('1 item')).toBeVisible()
  await expect(page.getByText('First item.')).toBeVisible()
})

test('able to edit title of existing list', async ({ listsPage, page }) => {
  await expect(page.getByText(listsPage.title)).toBeVisible()

  await page.getByRole('button', { name: 'Edit title' }).click()
  await page.getByPlaceholder('Enter a title...').fill('My test title')
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(
    page.getByText('Title of this list has been updated.'),
  ).toBeVisible()

  await expect(page.getByText('My test title')).toBeVisible()
})

test('able to edit entry of existing list', async ({ listsPage: _, page }) => {
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
