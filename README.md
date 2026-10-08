# Legba Dashboard

The customer dashboard for [Legba](https://www.legba.app): API keys, sessions, MCP, the agent
skill and plans. Built with Next.js 16.4 (App Router, Cache Components, Partial Prefetching,
React Compiler, typed routes), React 19.3, Tailwind CSS 4.3 and shadcn on Base UI.

Live: **https://legba-dashboard.vercel.app**. Every push to `main` deploys to production.

## Run it

Requires Node 24 and pnpm 11 (`corepack enable` picks up the pinned version).

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

No environment variables are needed: the backend is a placeholder (see below).

| Script | What it does |
| --- | --- |
| `pnpm dev` | Dev server. Runs with `--no-server-fast-refresh`: Next 16.4's server HMR breaks `catchError` boundaries. |
| `pnpm dev:scan` | Dev server with [React Scan](https://react-scan.com) loaded, for render profiling. |
| `pnpm build` / `pnpm start` | Production build and server. |
| `pnpm lint` | Biome (lint and format check). |
| `pnpm typecheck` | `next typegen` then `tsc --noEmit`. |
| `pnpm test` | Vitest unit tests. |

## Signing in and demo states

There is no authentication: the login screens are placeholders and any username and password
continue to the dashboard. The username can switch a **demo state**, so every UX state can be seen
through the real interface:

| Username | State |
| --- | --- |
| anything | The normal dashboard: Ghost and Shield active, Agent plan on Free. |
| `empty@demo.legba.app` | First-use empty states: extension inactive, no keys. |
| `flaky@demo.legba.app` | List services fail for 6 seconds after login (error states with Try again), then recover. |
| `slow@demo.legba.app` | 2.5 seconds of latency (loading skeletons). |

The placeholder backend (`src/server/`) keeps its data in memory, per server instance: a restart
(or, on Vercel, a different serverless instance) resets created keys and plan changes.

## What's where

```
src/
  app/            routes: (auth) login/register/forgot/SSO, (app) overview, sessions, MCP,
                  agent skill, API keys, plans; error, global-error and not-found screens
  features/       one folder per area (overview, subscriptions, plans, api-keys, developers,
                  search, shell, billing, auth): its components, actions and helpers
  components/
    ui/           shadcn components on Base UI (compose with `render`, never `asChild`)
    patterns/     shared states: section card, empty state, section error boundary, status screen
    hairline/     the hairline figure host, its kernel and one figure module per place
    brand/        the Legba mark and wordmark, used exactly as provided
  content/        every user-facing string (`copy.ts` barrel over `copy/<area>.ts`)
  server/         placeholder backend: demo state, in-memory store, services, simulated latency/failure
docs/design/      the mockups, measured specs, responsive notes and decisions.md
```

## Design rules

The full list lives in `AGENTS.md` and `docs/design/decisions.md`. The ones that shape every screen:

- Login and Overview match the mockups in `docs/design/mockups/` (1440px), except where a
  recorded decision changed them.
- Icons appear only in the nav bar and on the login screens. Buttons are text; lists use small
  neutral dots; there are no red square markers and no red glow on modals.
- Every empty and error state shows its own [hairline](https://hairline.lucasmarkes.com) line figure,
  drawn for that one place: no figure is used twice. Ghost, Shield and the Agent plan card have
  interactive figures (hover them, or focus and use the arrow keys).
- The only loader is the orb in `src/components/ui/spinner.tsx`; layout regions use skeletons.
- Not public yet, so marked **Preview**: the browser API host, the MCP config and the agent skill
  install command.
- `cn` comes from the `cn` package; there is no `clsx` or `tailwind-merge`.
