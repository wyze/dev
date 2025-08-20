import type { AppLoadContext } from 'react-router'
import type { ExternalToast } from 'sonner'

export type Tst = ExternalToast & {
  title: string
  type: 'error' | 'info' | 'success' | 'warning'
}

export type HelperArgs = {
  context: AppLoadContext
  request: Request
}
