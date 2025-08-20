import {
  index,
  prefix,
  type RouteConfig,
  route,
} from '@react-router/dev/routes'

export default [
  index('modules/home/route.tsx'),
  ...prefix('lists', [
    index('modules/list/index.tsx'),
    route(':id', 'modules/list/details.tsx'),
  ]),
] satisfies RouteConfig
