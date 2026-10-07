<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Legba Dashboard — project rules

Customer dashboard for Legba (`app.legba.xyz`). Next.js 16.4 (App Router, Cache Components, Partial
Prefetching, React Compiler, typed routes), React 19.3, Tailwind 4.3, shadcn (Base UI), pnpm 11, Node 24.

## Sources of truth
- `docs/design/mockups/{login,overview}.png` — the screens must match these exactly (1440px wide; PNG
  pixels ÷ 1.38889 = CSS px). **Mockup beats the website brand guide** (Montserrat, glows, red planes, copy
  verbatim — the user decided this on 2026-10-07).
- `docs/design/spec/*.json` — measured element specs; `docs/design/decisions.md` — every accepted deviation.
- `src/content/copy.ts` — the single import for every user-facing string; the strings live in
  `src/content/copy/<area>.ts` (one file per area/owner).
- Before using any framework API, read the matching guide in `node_modules/next/dist/docs/`.

## Conventions
- `cn` comes from the `cn` package (`import { cn } from "cn"` or `@/lib/utils`). **Never import `clsx` or
  `tailwind-merge`.** Variants use `class-variance-authority`.
- shadcn components are Base UI: compose with the `render` prop, **never `asChild`**. Links get
  `buttonVariants()` on `<Link>`/`<a>`; external and `mailto:` links are plain `<a>`.
- The **only** loading indicator is the orb in `src/components/ui/spinner.tsx` (aicss.dev, MIT). No
  `animate-spin`, `Loader2`, or other spinners. Layout regions use skeletons.
- Every screen and data-backed section handles loading, empty, error, and success (ux-guidelines skill).
  Services throw `ServiceError`; they never turn a failure into `[]`.
- **There is no authentication** (user decision): the login screens are placeholders and any
  username/password continues to the dashboard. No sessions, no route guard. `src/server/demo.ts`
  holds the placeholder account and the demo state; `cookies()` reads happen only below `<Suspense>`.
- Mobile follows the mobile-native skill: hover only under `(hover:hover) and (pointer:fine)`, `:active`
  press feedback, 16px inputs, `100dvh`, safe-area insets, scroll-snap carousels, never disable zoom.
- Motion follows emil-design-eng: custom ease-out curves, UI animations ≤ 250ms, transform/opacity only,
  no animation on keyboard-triggered UI (⌘K), reduced motion respected.

## React best practices on Next 16.4 (overrides for `.claude/skills/vercel-react-best-practices`)
The skill predates Next 16.3/16.4 and React 19.3. Where they disagree, these win:
- `server-cache-lru` → use `"use cache"` + `cacheLife` + `cacheTag`; `unstable_cache` is replaced.
- `async-suspense-boundaries` → under Cache Components, uncached/request data outside `<Suspense>` is a
  blocking-route **build error**: stream it (Suspense), cache it (`use cache`), or block (`instant = false`).
- `bundle-defer-third-party` / `bundle-dynamic-imports` → `dynamic(..., { ssr: false })` only inside
  `"use client"` files; or use `next/script` / `use(browser())`.
- `rerender-memo*`, `rendering-hoist-jsx`, memo parts of other rules → no-ops with the React Compiler on:
  don't add `memo`/`useMemo`/`useCallback`; keep functional `setState`.
- `advanced-use-latest`, `advanced-event-handler-refs` → use `useEffectEvent`.
- "middleware" → `proxy.ts` (Node runtime only). Auth is still checked in every Server Action.
- `rendering-activity` → Next keeps up to 3 visited routes in `<Activity>`: clean up effects and reset
  sensitive UI (one-time API keys, open dialogs) when hidden.
- `rendering-script-defer-async` → `<Script strategy="beforeInteractive">` only in the root layout.

## Hairline figures
- `src/components/hairline/document-stack/` is the user's portable docs-hero component, vendored
  byte-identical — do not edit it. Its `kernel.js` (sha256 header `8e2abc…`) is the one shared engine.
- Ghost/Shield figures come from the `hairline-create` skill and follow its ten rules: no colour inside a
  figure; red comes from host CSS (`--hairline-hi`).

## Demo states (placeholder backend — type at login, any password)
- Any username/password → the normal dashboard (Jane Doe, Ghost + Shield, the mockup's data).
- `flaky@demo.legba.app` — list services fail for 6s after login, then recover (error + retry states).
- `slow@demo.legba.app` — 2.5s latency (skeleton states).
- `empty@demo.legba.app` — no subscriptions or keys (first-use empty states).
- The store is in-memory: a restart resets created keys.

## Product
- The dashboard serves the **Legba API, MCP, and the agent skill**. Tabs: Overview · Sessions · MCP ·
  Agent Skill · API Keys. Copy follows the website's approved messaging
  (Website/Legba/docs/brand-voice.md): no "Inference Box", no retired phrases ("no logs", "solutions"…).
- Not public yet, so always marked **Preview** and never presented as live: the browser API host
  (`https://{your-api-host}/orgs/{org_uuid}/api`), the MCP config, the agent skill install command.

## Dev server
- `pnpm dev` runs `next dev --no-server-fast-refresh`: Next 16.4 server HMR breaks `catchError` ("Cannot redefine property: catchError"). Keep the flag until a Next patch fixes it.

## Verification
- Gates: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- Grep gates: no `clsx`/`tailwind-merge` imports, no spinner classes outside the orb, no `asChild`.
- Visual QA uses Claude in Chrome **on this Mac's Chrome only** (`list_connected_browsers` first; never
  another device), one agent at a time, foreground tab, localhost only. Phone widths (< 500px) use
  Playwright emulation, named as such in reports.
- QA runs in independent subagents per the qa-guidelines skill; QA agents report, never fix.

## Git
- Small conventional commits; author and committer `aharish4@asu.edu` (`git log --format='%ae %ce'`).
- Push to the private `legba-dashboard` GitHub repo after every milestone.
