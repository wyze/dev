export function capitalize([first, ...value]: string) {
  return first.toUpperCase().concat(...value)
}
