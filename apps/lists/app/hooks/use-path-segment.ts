import { useLocation } from 'react-router'

export function usePathSegment(position: number): string | undefined
export function usePathSegment(): string[]
export function usePathSegment(position?: number) {
  const { pathname } = useLocation()
  const segments = pathname.split('/').slice(1)

  return typeof position === 'number' ? segments.at(position) : segments
}
