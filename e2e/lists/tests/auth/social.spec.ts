import { expect, test } from '@playwright/test'
import * as OTPAuth from 'otpauth'

process.loadEnvFile()

function totp() {
  return new OTPAuth.TOTP({
    secret: `${process.env.GOOGLE_AUTH_TOTP_SECRET}`,
    digits: 6,
    algorithm: 'sha1',
    period: 30,
  }).generate()
}

test.describe.configure({ mode: 'serial' })

test('throws error when trying to sign in with google without existing account', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByText('Sign in').click()
  await page.getByRole('button', { name: 'Sign in with Google' }).click()
  await page
    .getByRole('textbox', { name: 'Email or phone' })
    .fill(`${process.env.GOOGLE_AUTH_EMAIL}`)
  await page.getByRole('button', { name: 'Next' }).click()
  await page
    .getByRole('textbox', { name: 'Enter your password' })
    .fill(`${process.env.GOOGLE_AUTH_PASSWORD}`)
  await page.getByRole('button', { name: 'Next' }).click()

  let code = totp()

  await page.getByRole('textbox', { name: 'Enter code' }).fill(code)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(500)

  if ((await page.getByText('Wrong code. Try again.').count()) > 0) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        const next = totp()

        if (next !== code) {
          code = next

          clearInterval(interval)
          resolve(null)
        }
      }, 500)
    })
  }

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(
    page.getByRole('heading', {
      name: 'Sign up is disabled on the sign in page.',
    }),
  ).toBeVisible()
})

test('able to create a new account with google', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Sign in').click()
  await page.getByText('Sign up').click()
  await page.getByRole('button', { name: 'Sign up with Google' }).click()
  await page
    .getByRole('textbox', { name: 'Email or phone' })
    .fill(`${process.env.GOOGLE_AUTH_EMAIL}`)
  await page.getByRole('button', { name: 'Next' }).click()
  await page
    .getByRole('textbox', { name: 'Enter your password' })
    .fill(`${process.env.GOOGLE_AUTH_PASSWORD}`)
  await page.getByRole('button', { name: 'Next' }).click()

  let code = totp()

  await page.getByRole('textbox', { name: 'Enter code' }).fill(code)
  await page.getByRole('button', { name: 'Next' }).click()
  await page.waitForTimeout(500)

  if ((await page.getByText('Wrong code. Try again.').count()) > 0) {
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        const next = totp()

        if (next !== code) {
          code = next

          clearInterval(interval)
          resolve(null)
        }
      }, 500)
    })

    await page.getByRole('textbox', { name: 'Enter code' }).fill(totp())
    await page.getByRole('button', { name: 'Next' }).click()
  }

  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByText('Add your first item')).toBeVisible()
})
