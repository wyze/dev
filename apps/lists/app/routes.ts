import {
  index,
  prefix,
  type RouteConfig,
  route,
} from '@react-router/dev/routes'

export default [
  index('modules/home/route.tsx'),
  route('api/auth/*', 'modules/auth/route.ts'),
  ...prefix('lists', [
    index('modules/list/index.tsx'),
    route(':id/*', 'modules/list/details.tsx'),
  ]),
  ...prefix('legal', [
    route('terms-of-service', 'modules/legal/terms-of-service.tsx'),
  ]),
] satisfies RouteConfig
