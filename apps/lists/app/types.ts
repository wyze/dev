import type { AppLoadContext } from 'react-router'

type Err<E> = { ok: false; value: E }
type Ok<T> = { ok: true; value: T }

export type Result<T, E> = Err<E> | Ok<T>

export type ServerArgs = {
  context: AppLoadContext
  request: Request
}
