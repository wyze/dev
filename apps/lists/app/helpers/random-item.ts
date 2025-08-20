function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomItem<T>(array: T[] | readonly T[]) {
  const index = random(0, array.length - 1)

  return array[index]
}
