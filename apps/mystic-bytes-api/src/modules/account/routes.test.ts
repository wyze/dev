import { describe, expect } from 'vitest'

import { it } from '@/test/context'

describe('POST /account', () => {
  it('should create an account', async ({ client }) => {
    const response = await client.account.$post({
      json: {
        email: 'mystic-bytes@example.com',
        name: 'A user',
        password: crypto.randomUUID(),
      },
    })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ key: expect.any(String) })
  })

  it('should show validation messages on error', async ({ client }) => {
    // @ts-expect-error We are intentionally omitting properties to test validation errors
    const response = await client.account.$post({ json: { email: 'mystic' } })

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({
      data: { email: 'mystic' },
      error: [
        'email must be an email address (was "mystic")',
        'name must be a string (was missing)',
        'password must be a string (was missing)',
      ],
      success: false,
    })
  })
})

describe('GET /account/me', () => {
  it('should retrieve my account details', async ({ client, options }) => {
    const response = await client.account.me.$get(undefined, options)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      createdAt: expect.stringMatching(/\d{4}-\d{2}-\d{2}T/),
      email: 'mystic-bytes@example.com',
      id: expect.any(String),
    })
  })

  it('handles when no api key header provided', async ({ client }) => {
    const response = await client.account.me.$get()

    expect(response.status).toBe(401)
    expect(await response.text()).toBe('Unauthorized')
  })

  it('handles when invalid api key header provided', async ({ client }) => {
    const response = await client.account.me.$get(undefined, {
      headers: { 'x-api-key': 'a string' },
    })

    expect(response.status).toBe(403)
    expect(await response.text()).toBe('Invalid API key.')
  })
})
