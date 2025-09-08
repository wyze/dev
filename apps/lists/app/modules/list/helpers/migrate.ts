import type { Env } from 'workers/app'

export async function migrate(
  env: Env,
  anonymous: { id: string },
  user: { id: string },
) {
  const existing = await env.LISTS.getByName(anonymous.id).get()
  const lists = env.LISTS.getByName(user.id)

  // Migrate lists from anonymous user to new user
  await Promise.all(
    existing.map(({ entries, shortId, ...list }) => lists.create(list)),
  )

  // Remove old durable object for anonymous user
  await env.LISTS.getByName(anonymous.id).destroy()
}
