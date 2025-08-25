import { cloudflare } from '@cloudflare/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import type { UserConfig } from 'vite'
import devtoolsJson from 'vite-plugin-devtools-json'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'
import tsconfigPaths from 'vite-tsconfig-paths'

export const icons = (): UserConfig => ({
  build: {
    rollupOptions: {
      input: 'src/icon.tsx',
    },
  },
  plugins: [
    iconsSpritesheet({
      withTypes: true,
      inputDir: 'src/icons',
      outputDir: 'src',
      typesOutputFile: 'src/types.ts',
      formatter: 'biome',
      // This prevents camel casing the name
      iconNameTransformer: (name) => name,
    }),
  ],
  server: {
    port: 3715,
  },
})

export const react = (): UserConfig => ({
  plugins: [
    cloudflare({
      viteEnvironment: { name: 'ssr' },
    }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson(),
  ],
})
