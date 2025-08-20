import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'
import tsconfigPaths from 'vite-tsconfig-paths'

export const react = (): UserConfig => ({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson(),
    iconsSpritesheet({
      withTypes: true,
      inputDir: 'app/modules/icon/svgs',
      outputDir: 'app/assets',
      typesOutputFile: 'app/modules/icon/types.ts',
      formatter: 'biome',
      // This prevents camel casing the name
      iconNameTransformer: (name) => name,
    }),
  ],
})
