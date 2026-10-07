# Design and engineering decisions

Every deviation from the mockups or from a default is recorded here with its reason.

## Product decisions (user, 2026-10-07)

| Topic | Decision |
|---|---|
| Fidelity | Login and Overview match `docs/design/mockups/*.png` exactly at 1440px. |
| Brand conflicts | **Mockup wins on visuals** over the website brand guide v4 (Montserrat, glows, red card planes). **Copy is rewritten for Legba** (user, later on 2026-10-07): no "Inference Box"; the dashboard serves the Legba API, MCP and the agent skill; wording follows the website's approved messaging, layout and line lengths stay as in the mockup. |
| Scope | Every other destination is a designed stub (title, designed empty state, main action). Only the API-key flow works end to end. |
| Navigation | **Overview · Sessions · MCP · Agent Skill · API Keys** (user, 2026-10-07) replaces the mockup's inference tabs (Deployments, Model Catalog, Registries); same layout and styling. |
| Logo | The locked doll mark and LEGBA wordmark are used exactly as provided: no filters, blur, recolouring or re-drawing (user, 2026-10-07). |
| Preview content | Not public yet, so shown and labelled **Preview** (user, 2026-10-07): the agent skill install command is the placeholder `npx skills add legba/agent-skill`; the MCP page shows illustrative client config with placeholder host/key; API samples use the website's preview host `https://{your-api-host}/orgs/{org_uuid}/api`. Swap in real values before launch. |
| Docs cards | The "■ DOCS" eyebrows are removed and the Product Documentation card becomes an install-the-agent-skill card (user, 2026-10-07). |
| Full width | Content and header span the viewport with the mockup's gutters; no max-width cap (user, 2026-10-07). |
| Backend | Placeholder backend (`src/server`): in-memory store and demo data. **No auth** (user, later on 2026-10-07): the login screen is a placeholder and any username/password continues to the dashboard; no sessions, no route guard. Typing a documented demo email at login switches a demo state (empty / error-then-retry / slow) so every UX state stays reachable for QA. |
| Git | All commits as `aharish4@asu.edu`; private repo `github.com/00-Aakash-00/legba-dashboard`. |
| Loaders | Every spinner is an aicss.dev orb. |
| Chrome | Claude in Chrome runs only on this Mac's Chrome. |

## Accepted deviations from the mockups

| Where | Mockup | Built | Why |
|---|---|---|---|
| Ghost / Shield card art | Particle renders with red glow | Hairline line figures (hairline-create skill); the card supplies the red glow, streaks and dust; the figure's single bright stroke is red | The user asked for hairline figures; hairline's rules forbid colour/glow inside a figure (rule 04). |
| Product Documentation art | A "DOC" file tile with grid lines | The website's portable `DocumentStack` docs-hero component, vendored byte-identical | The user asked for the website's docs hero imagery. |
| Login showcase slides 2–3 | Only slide 1 is drawn | Slides reuse mockup copy (Ghost Mode / Shield Mode lines) | No other copy exists; inventing positioning was avoided. |
| "Remember me" | Checked | Defaults to checked | Matches the mockup. |

## Engineering decisions

| Decision | Reason |
|---|---|
| Next.js **16.4.0**, React 19.3, Cache Components + Partial Prefetching + React Compiler + typed routes | User asked for 16.4; scaffolded with create-next-app@16.4.0. |
| `(app)` layout `ensureStatic = 'shell'`; `(auth)` layout `ensureStatic = 'navigation'` | Default links fetch only the static App Shell; auth pages are fully static (the form reads `next` on the client). |
| Session read only below `<Suspense>`; nav in Suspense with a static fallback | Cache Components build rules; `useSelectedLayoutSegment` suspends on `/subscriptions/[id]`. |
| `proxy.ts` gates GET/HEAD only; every action/service calls `requireUser()` | Server Actions POST to page URLs; the docs say not to rely on Proxy alone. |
| shadcn **Base UI** primitives (style base-nova), CLI pinned to 4.21.3 | Current shadcn default; 4.21.4 was under the 24h age gate. |
| `cn` package everywhere; Turbopack `resolveAlias` maps `clsx`/`tailwind-merge` → `cn` | User asked to replace clsx + tailwind-merge; cva imports `{ clsx }`, which `cn` exports. No clsx in the client bundle. |
| Loader = AICSS orb **S1 lattice** (MIT), 20px in buttons | Rendered S1 vs C3 at 16/20/32/44px on the red pill and canvas: the 3×3 lattice echoes the mockup's pixel squares and stays crisp; C3 read as a generic spinner. |
| Montserrat via `next/font` | Render check against the mockup's headline: closer than Poppins/Urbanist. |
| No Embla; native scroll-snap carousels | mobile-native prefers native scroll-snap; fewer bytes. |
| No Shiki; static token arrays for the 5-line code samples | Exact mockup colours, zero runtime. |
| No PWA manifest | Not requested; standalone mode would add an untested surface. |
| generativecharts.com evaluated, **not adopted** | Neither mockup has a chart and the placeholder backend has no real data; a chart would show invented numbers. |
| pnpm `minimumReleaseAge: 1440` with exact excludes for the `next@16.4.0` family | 16.4.0 was <24h old at bootstrap; remove the excludes once it ages. |
| pnpm `trustPolicy` not used | It rejected `undici-types@6.21.0` (from `@types/node`); not requested. |
| React Scan via pinned `next/script` (SRI) behind `REACT_SCAN=1` in dev | Avoids the npm package's floating `latest` deps; keeps screenshots clean by default. |
| `next dev --no-server-fast-refresh` | Next 16.4 server HMR re-instantiates `next/error` and throws "Cannot redefine property: catchError", turning (app) routes into 500s after edits. Client Fast Refresh still works; server components re-evaluate fully. Revisit on the next Next patch. |

## Generated imagery (Higgsfield)

| File | Model | Job | Notes |
|---|---|---|---|
| `public/images/overview/api-keys-hero.webp` | gpt_image_2 (image edit of the mockup hero crop), 21:9, 4k | 6fc6329d-2d98-425f-ada3-2829fedf0d5d | Text/UI removed; resized to 2560px WebP (157 KB). Judge score 9/10; render with `object-cover object-top` (top-aligned, streaks within 1–3px). |
| `public/images/avatars/default.webp` | nano_banana_flash, 1:1, 1k | 1b31a92e-90a7-4654-8c26-77448768c5b7 | Non-identifiable stylised portrait; 192px WebP. Judge pick for mood match at 40px. |

No logo, doll mark, or LEGBA text was ever generated (locked assets only).
