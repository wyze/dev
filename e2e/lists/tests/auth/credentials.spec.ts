import { expect, test } from '@playwright/test'

import { randomUUID } from 'node:crypto'

test('able to create a new account', async ({ page }) => {
  const id = randomUUID()
  const password = randomUUID()

  await page.goto('/')
  await page.getByText('Sign in').click()
  await page.getByText('Sign up').click()

  const button = page.getByRole('button', { name: 'Create account' })
  await expect(button).toBeVisible()
  await page.getByPlaceholder('me@example.com').fill(`${id}@example.com`)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await button.click()
  await expect(page.getByText('Add your first item')).toBeVisible()
})

test('able to sign in to an existing account', async ({ page }) => {
  const id = randomUUID()
  const email = `${id}@example.com`
  const password = randomUUID()

  await page.goto('/')
  await page.getByText('Sign in').click()
  await page.getByText('Sign up').click()

  const button = page.getByRole('button', { name: 'Create account' })
  await expect(button).toBeVisible()
  await page.getByPlaceholder('me@example.com').fill(email)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await button.click()
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByText('Log out').click()
  await page.getByPlaceholder('me@example.com').fill(email)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Add your first item')).toBeVisible()
})

test('throws error when trying to create duplicate account', async ({
  page,
}) => {
  const email = `${randomUUID()}@example.com`
  const password = randomUUID()

  await page.goto('/')
  await page.getByText('Sign in').click()
  await page.getByText('Sign up').click()

  const button = page.getByRole('button', { name: 'Create account' })
  await expect(button).toBeVisible()
  await page.getByPlaceholder('me@example.com').fill(email)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await button.click()
  await page.getByRole('button', { name: 'User menu' }).click()
  await page.getByText('Log out').click()
  await page.getByText('Sign up').click()
  await expect(button).toBeVisible()
  await page.getByPlaceholder('me@example.com').fill(email)
  await page.getByPlaceholder('••••••••••••').fill(password)
  await button.click()
  await expect(
    page.getByRole('heading', {
      name: 'User already exists. Use another email.',
    }),
  ).toBeVisible()
})
