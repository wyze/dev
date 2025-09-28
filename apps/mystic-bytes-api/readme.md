<div align="center">
  <h1 align="center"><a href="https://api.mystic-bytes.wyze.dev">Mystic Bytes API</a></h1>
  <p>Collect, evolve, and conquer with mythical power in digital form.</p>
</div>

## Features

- 👥 Account management

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

Your application will be available at `http://localhost:8787`.

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
pnpx wrangler deploy
```

To deploy a preview URL:

```sh
pnpx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
pnpx wrangler versions deploy
```

---

Built with ❤️ using Hono.
