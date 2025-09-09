import { usePathSegment } from '~/hooks/use-path-segment'

export function useAuthAction() {
  const segment = usePathSegment(0)
  const action = segment
    ?.slice(0, 1)
    .toUpperCase()
    .concat(segment.slice(1).replace('-', ' '))

  return { action, pathname: `/${segment}`, segment }
}
