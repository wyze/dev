import { useNavigation } from 'react-router'

export function useIsNavigating() {
  return useNavigation().state !== 'idle'
}
