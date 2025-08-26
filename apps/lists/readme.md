<div align="center">
  <h1 align="center"><a href="https://lists.wyze.dev">Lists</a></h1>
  <p>An application that allows you to make various types of lists with different functionality.</p>
</div>

## Features

- 📋 Basic list
- ☑️ Todo list

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
pnpm build
pnpx wrangler deploy
```

To deploy a preview URL:

```sh
pnpm build
pnpx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
pnpx wrangler versions deploy
```

---

Built with ❤️ using React Router.
