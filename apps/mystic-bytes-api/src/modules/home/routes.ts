import { factory } from '@/helpers/factory'

export const routes = factory.createApp().get('/', (c) => c.redirect('/docs'))
