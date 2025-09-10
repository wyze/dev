import {
  index,
  layout,
  prefix,
  type RouteConfig,
  route,
} from '@react-router/dev/routes'

export default [
  index('modules/home/route.tsx'),
  route('api/auth/*', 'modules/auth/api.ts'),
  layout('modules/auth/route.tsx', [
    route('forgot-password', 'modules/auth/forgot-password.tsx'),
    route('reset-password', 'modules/auth/reset-password.tsx'),
    route('sign-in', 'modules/auth/sign-in.tsx'),
    route('sign-up', 'modules/auth/sign-up.tsx'),
  ]),
  ...prefix('lists', [
    index('modules/list/index.tsx'),
    route(':id/*', 'modules/list/details.tsx'),
  ]),
  ...prefix('legal', [
    route('acceptable-use', 'modules/legal/acceptable-use.tsx'),
    route('privacy-policy', 'modules/legal/privacy-policy.tsx'),
    route('terms-of-service', 'modules/legal/terms-of-service.tsx'),
  ]),
] satisfies RouteConfig
