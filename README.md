# tier_nation monorepo

This repository is now organized as a monorepo with separate frontend and backend applications:

- `client`: React + TypeScript + Vite UI
- `server`: Go HTTP API service

## Structure

```
.
├── client/
├── server/
├── package.json
└── pnpm-workspace.yaml
```

## Requirements

- Node.js + pnpm
- Go 1.22+

## Install frontend dependencies

```bash
pnpm install
```

## Run apps

Frontend UI:

```bash
pnpm dev:client
```

Go backend:

```bash
pnpm dev:server
```

## Build apps

Frontend UI:

```bash
pnpm build:client
```

Go backend:

```bash
pnpm build:server
```
