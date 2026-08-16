# Shared Modules

`packages/shared` is a workspace package used by the leaderboard Worker,
 bot Worker, and the Next.js web app (`apps/web`).

The source of truth is the TypeScript under `packages/shared/src/`. Each module
builds to `packages/shared/dist/` and is consumed via `@yourrank/shared/*`
workspace imports.

## Build Process

```bash
bun run --cwd packages/shared build
```

Or from the repo root:

```bash
cd packages/shared && bun run build
```

After editing any `.ts` file in `packages/shared/src`:
1. Run the build command above.
2. Import from `@yourrank/shared/<module>` in Workers and the Next.js app.

The `dist/` directory is generated; do not edit it directly.
