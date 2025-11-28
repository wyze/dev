import { index, type RouteConfig, route } from '@react-router/dev/routes'

export default [
  index('modules/home/route.tsx'),
  route('timer/:slug', 'modules/timer/route.tsx'),
] satisfies RouteConfig
