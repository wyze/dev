import alchemy, { type Phase } from 'alchemy'
import { KVNamespace, ReactRouter } from 'alchemy/cloudflare'
import { GitHubComment } from 'alchemy/github'
import { CloudflareStateStore } from 'alchemy/state'

const isTesting = process.env.STAGE === 'playwright'
const [owner = 'wyze', repository = ''] =
  process.env.GITHUB_REPOSITORY?.split('/') ?? []

if (isTesting) {
  try {
    process.loadEnvFile(`${import.meta.dirname}/.env`)
  } catch {
    // Couldn't load .env file
  }
}

const app = await alchemy('tick', {
  phase: (process.env.PHASE ?? 'up') as Phase,
  quiet: isTesting,
  stateStore: (scope) => new CloudflareStateStore(scope),
})

const timers = await KVNamespace('timers')

export const worker = await ReactRouter('app', {
  bindings: {
    TIMERS: timers,
  },
  build: 'vite build',
  compatibilityDate: '2025-11-13',
  dev: 'vite',
  domains: app.stage === 'prod' ? [`${app.name}.${owner}.dev`] : undefined,
})

if (!isTesting) {
  const { url } = worker
  const pr = app.stage.startsWith('pr-')
    ? Number(app.stage.replace('pr-', ''))
    : null

  console.log({ url })

  if (pr) {
    await GitHubComment('preview-comment', {
      owner,
      repository,
      issueNumber: pr,
      body: [
        '## 🚀 Preview Deployed',
        '',
        'Your changes have been deployed to a preview environment:',
        '',
        `**🌐 Website:** ${url}`,
        '',
        `Built from commit ${process.env.GITHUB_SHA?.slice(0, 7)}`,
        '',
        '---',
        '<sub>🤖 This comment updates automatically with each push.</sub>',
      ].join('\n'),
    })
  }
}

await app.finalize()
