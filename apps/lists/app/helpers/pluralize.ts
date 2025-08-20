export function pluralize(label: string, value: number) {
  return [value.toLocaleString(), ' ', label, value === 1 ? '' : 's']
    .join('')
    .replace(/ys$/, 'ies')
}
