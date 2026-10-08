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
| Icons | **Only in the nav bar and on the login screens** (user, 2026-10-07): the header (tabs, search, support/docs, Top-Up), the mobile top bar and tab bar, and login/register/forgot/SSO. Everywhere else buttons and links are text, lists use CSS bullets, toasts and dialogs have no glyphs. |
| Empty and error states | Each shows a hairline figure (hairline-create skill) drawn for that page, never an icon tile (user, 2026-10-07). |
| Unique figures | Every hairline figure is used in exactly one place and no figure is a variant of another (user, 2026-10-07). |
| Plans | "Your subscriptions" lists every plan with its status (Inactive / Free plan / Active); cards and View All open the dashboard's own `/plans` page, where people subscribe (placeholder, no payment) (user, 2026-10-07). Nested boxes follow outer radius = inner radius + padding. All three plan cards are visible side by side wherever they fit (from 800px of panel width, stacked card layout); a carousel only below that (user, 2026-10-07). |
| Red squares | No red rounded-square markers anywhere: section bullets, list bullets, LED tiles, the rack art's glyphs (user, 2026-10-07: "I dont like the way this is used everywhere"). Titles are plain text; lists use a small neutral dot. Modals have no red top glow. |
| QA | QA and browser-driving agents run on Sonnet; QA starts only after everything is built, the caches are cleared and the app is rebuilt from clean (user, 2026-10-07). |
| Chrome | Claude in Chrome runs only on this Mac's Chrome. |

## Accepted deviations from the mockups

| Where | Mockup | Built | Why |
|---|---|---|---|
| Ghost / Shield card art | Particle renders with red glow | Hairline line figures (hairline-create skill); the card supplies the red glow, streaks and dust; the figure's single bright stroke is red | The user asked for hairline figures; hairline's rules forbid colour/glow inside a figure (rule 04). |
| Product Documentation art | A "DOC" file tile with grid lines | The website's portable `DocumentStack` docs-hero component, vendored byte-identical | The user asked for the website's docs hero imagery. |
| Login showcase slides | Only slide 1 is drawn | Three slides of approved Legba lines (brand-voice.md §7): the tagline with red on "using you." only, the agent skill line, and "Two modes. One extension." with "Pick a mode. Open the page. Close the tab." | Copy rewritten for Legba; the red follows the website's final CTA. |
| Showcase slide 1 heading | One line | Wraps to two lines from 1024 to 1440px, so the mark sits about 33px higher | The approved tagline is longer; copy stays word for word. |
| Doll mark (lockup and showcase) | Face recoloured | The locked mark exactly as provided (its black face shows) | Logo decision. |
| "Remember me" | Checked | Defaults to checked (visual only: there is no auth) | Matches the mockup. |
| Button and list icons (Create API Key key + chevron, Launch ↗, View All ↗, Explore ↗, carousel arrows, Manage ›, feature icons, copy glyphs) | Icons | Text labels; Previous/Next as text (only where the cards don't all fit); neutral dots for features | The icons rule. |
| "■ Your subscriptions" and section bullets | Red square bullet | Plain title text | The red-squares rule. |
| Subscriptions panel at 1440 | Two wide cards + filter + arrows | Three stacked cards (Ghost, Shield, Agent plan) with statuses, no filter, no arrows | The plans decision; the panel is taller, so the docs column stretches to match. |
| Sessions card rack art | Red rounded-square LEDs on each row | A small unlit ring per row | The red-squares rule. |
| Error screens | One "Something went wrong" screen | Three scopes, each with its own figure: a page (plug), the dashboard frame ("The dashboard didn't load", breaker), the whole app (fuse) | Unique figures; the frame error says what actually failed. |
| Empty and error states | Icon tile | The page's own hairline figure | The empty/error-state and unique-figure rules. |

## Engineering decisions

| Decision | Reason |
|---|---|
| Next.js **16.4.0**, React 19.3, Cache Components + Partial Prefetching + React Compiler + typed routes | User asked for 16.4; scaffolded with create-next-app@16.4.0. |
| `(app)` layout `ensureStatic = 'shell'`; `(auth)` layout `ensureStatic = 'navigation'` | Default links fetch only the static App Shell; auth pages are fully static placeholders with no request data (no `?next=` redirect). |
| Demo-state cookie read only below `<Suspense>`; nav in Suspense with a static fallback | Cache Components build rules; `useSelectedLayoutSegment` suspends on dynamic segments. |
| No `proxy.ts`, no route guard | There is no authentication (user decision); the demo state is a cookie set at login. |
| Search palette ranks its own rows (`shouldFilter={false}` + cmdk's `defaultFilter`) | cmdk 1.1.1 never reorders groups and doesn't re-sort rows a query brings back, so Enter could go to a weak match. |
| shadcn **Base UI** primitives (style base-nova), CLI pinned to 4.21.3 | Current shadcn default; 4.21.4 was under the 24h age gate. |
| `cn` package everywhere; Turbopack `resolveAlias` maps `clsx`/`tailwind-merge` → `cn` | User asked to replace clsx + tailwind-merge; cva imports `{ clsx }`, which `cn` exports. No clsx in the client bundle. |
| Loader = AICSS orb **S1 lattice** (MIT), 20px in buttons | Rendered S1 vs C3 at 16/20/32/44px on the red pill and canvas: the 3×3 lattice echoes the mockup's pixel squares and stays crisp; C3 read as a generic spinner. |
| Montserrat via `next/font` | Render check against the mockup's headline: closer than Poppins/Urbanist. |
| No Embla; native scroll-snap carousels | mobile-native prefers native scroll-snap; fewer bytes. |
| No Shiki; static token arrays for the 5-line code samples | Exact mockup colours, zero runtime. |
| No PWA manifest | Not requested; standalone mode would add an untested surface. |
| generativecharts.com evaluated, **not adopted** | Neither mockup has a chart and the placeholder backend has no real data; a chart would show invented numbers. |
| pnpm `minimumReleaseAge: 1440` | Supply-chain hygiene; the bootstrap-time excludes for the `next@16.4.0` family were removed once it aged past 24h. |
| pnpm `trustPolicy` not used | It rejected `undici-types@6.21.0` (from `@types/node`); not requested. |
| React Scan via pinned `next/script` (SRI) behind `REACT_SCAN=1` in dev | Avoids the npm package's floating `latest` deps; keeps screenshots clean by default. |
| `next dev --no-server-fast-refresh` | Next 16.4 server HMR re-instantiates `next/error` and throws "Cannot redefine property: catchError", turning (app) routes into 500s after edits. Client Fast Refresh still works; server components re-evaluate fully. Revisit on the next Next patch. |

## Generated imagery (Higgsfield)

| File | Model | Job | Notes |
|---|---|---|---|
| `public/images/overview/api-keys-hero.webp` | gpt_image_2 (image edit of the mockup hero crop), 21:9, 4k | 6fc6329d-2d98-425f-ada3-2829fedf0d5d | Text/UI removed; resized to 2560px WebP (157 KB). Judge score 9/10; render with `object-cover object-top` (top-aligned, streaks within 1–3px). |
| `public/images/avatars/default.webp` | nano_banana_flash, 1:1, 1k | 1b31a92e-90a7-4654-8c26-77448768c5b7 | Non-identifiable stylised portrait; 192px WebP. Judge pick for mood match at 40px. |

No logo, doll mark, or LEGBA text was ever generated (locked assets only).
