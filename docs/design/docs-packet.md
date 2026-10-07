# Legba Dashboard — implementation docs packet

Read this before writing code. Compiled 2026-10-07 against the versions installed (or about to be installed) in this repo. Every factual bullet ends with `[src: …]`. Where I proved something by running it, the tag says `RUN`.

**How this was verified**
- Next.js: the docs bundled in `node_modules/next/dist/docs/` (16.4.0) are the authority. Where they were silent I read the compiled 16.4.0 source in `node_modules/next/dist/` and the Turbopack Rust source at `github.com/vercel/next.js` tag `v16.4.0`.
- shadcn: I ran the real `shadcn@4.21.3` CLI (`init`, then `add`) against a **scratch copy** of this repo with the same `package.json`, `pnpm-workspace.yaml`, lockfile, `next.config.ts`, `tsconfig.json` and `src/app`. Section 3 quotes what it wrote. Scratch copy: `/private/tmp/claude-501/-Users-aakash-Documents-Projects-Legba-LegbaDashboard/085b3a8f-403e-41d2-a31b-1e72a37d617b/scratchpad/w1/docs-packet/initproj` (available for this session only).
- I type-checked the TS snippets in this packet with `next typegen && tsc --noEmit` in that scratch copy, with `typedRoutes` on. I ran Vitest 5.0.3, zod, jose and cn in Node, and compiled the Tailwind snippets with `@tailwindcss/node` 4.3.3.
- Not done, because it is forbidden: `next dev` and `next build`. Behaviour that only shows up at build time is cited from docs and source.

**Source legend**
`NEXT` = `node_modules/next/dist/docs/01-app/…` (16.4.0) · `NEXT-SRC` = `node_modules/next/dist/…` · `TP-SRC` = vercel/next.js@v16.4.0 Rust source · `TW` = tailwindlabs/tailwindcss.com `src/docs/*.mdx` (= tailwindcss.com/docs/…) · `TW-CL` = tailwindcss `CHANGELOG.md` · `TWT` = `node_modules/@tailwindcss/turbopack/` 4.3.3 · `SH` = shadcn-ui/ui `apps/v4/content/docs/…` (= ui.shadcn.com/docs/…) · `SH-REG` = ui.shadcn.com/r/styles/base-nova/*.json · `SH-CLI` = shadcn@4.21.3 `--help` and the scratch run · `BUI` = `@base-ui/react@1.8.0/docs/react/…` (docs shipped inside the npm tarball = base-ui.com/react/…) · `CN` = cn@0.4.0 tarball (README, `dist/*.d.ts`) and shadcn-ui/cn `docs/` · `SON` = sonner@2.0.8 tarball (`dist/index.d.ts`, `dist/index.mjs`) and sonner.emilkowal.ski · `CMDK` = cmdk@1.1.1 tarball · `ZOD` = zod@4.6.5 and colinhacks/zod `packages/docs/content` (= zod.dev) · `JOSE` = jose@6.2.12 and panva/jose `v6.x/docs` · `AICSS` = kvnkld/aicss@3ca50a3 (orb files last changed in 456d944) · `VT` = vitest@5.0.3, vite@8.3.3 types, vitejs/vite `docs/config/shared-options.md`.

---

## 0. Versions and top gotchas

### Versions (checked against the npm registry on 2026-10-07)

| Package | Version | Notes |
|---|---|---|
| next | 16.4.0 | installed |
| react / react-dom | 19.3.0 | installed |
| tailwindcss / @tailwindcss/turbopack | 4.3.3 / 4.3.3 | installed. The loader was published 2026-07-31 |
| typescript | 5.9.3 | installed |
| shadcn (CLI) | **4.21.3** | 4.21.4 was published 2026-10-07T11:12Z. The repo's `minimumReleaseAge: 1440` keeps it out for 24 h, so pin `shadcn@4.21.3` explicitly |
| @base-ui/react | 1.8.0 (2026-09-04) | `shadcn init` added `^1.8.0` |
| cn | 0.4.0 | `shadcn init` added `^0.4.0` |
| class-variance-authority | 0.7.1 | depends on `clsx` (ESM `import { clsx } from "clsx"`) |
| lucide-react | 1.52.0 | added by init (preset `nova` → `iconLibrary: "lucide"`) |
| tw-animate-css | 1.4.0 | added by init |
| sonner | 2.0.8 | `shadcn add sonner` also adds **next-themes ^0.4.6** |
| cmdk | 1.1.1 | depends on `@radix-ui/react-dialog` |
| zod | 4.6.5 | |
| jose | 6.2.12 | |
| vitest | 5.0.3 | needs peer `vite` (^6.4, ^7 or ^8). pnpm resolved vite 8.3.3 |

### Top gotchas (each is detailed and cited below)
1. **`shadcn init` writes `--font-sans: var(--font-sans)` into `@theme inline`.** Tailwind then emits it as `@layer theme { :root { --font-sans: var(--font-sans) } }`, a self-reference.
   - It only works while the next/font class that defines `--font-sans` sits on `<html>`, because unlayered next/font CSS beats `@layer theme`. This repo's current build shows both rules.
   - Move that class to `<body>` and the font silently falls back.
   - Distinct names such as `--font-montserrat` are safer. See §2.2 and §3.3.
2. **`cn` treats unknown `text-*` names as colours.** `cn("bg-primary text-primary-foreground", "text-display")` silently drops `text-primary-foreground`. Custom font-size tokens need `createCn`, a t-shirt-style name, or an arbitrary value. Also, shadcn components import `cn` from `"cn"` directly, not from `@/lib/utils`. See §5.
3. **`catchError` passes `error: unknown`, not `Error`.** `error.message` fails `tsc` (verified). Narrow it with `instanceof Error`. See §1.4.
4. **`z.email().trim()` does not trim before validating.** Use `z.string().trim().pipe(z.email(...))`. See §8.
5. **sonner defaults to `theme="light"`.** shadcn's `sonner.tsx` uses `next-themes` and a `Loader2Icon animate-spin` loading icon. Both must go in this project, which is dark-only and uses the orb as its only spinner. See §3.7 and §6.
6. **Base UI `Menu.GroupLabel` throws outside `Menu.Group`/`Menu.RadioGroup`.** This means shadcn's `DropdownMenuLabel` must sit inside `DropdownMenuGroup`. See §4.
7. **`Select.Value` renders the raw value** unless you pass `items` to `Select.Root`. See §4.
8. **cmdk binds Ctrl+K as "previous item"** (vim bindings on by default). A global ⌘K/Ctrl+K toggle must ignore `defaultPrevented` events, or you set `vimBindings={false}`. See §7.
9. Under Cache Components:
   - `cookies()`, `searchParams`, uncached data, `useSearchParams()`, and `useSelectedLayoutSegment()` on unknown dynamic params all need a `<Suspense>` boundary.
   - `refresh()` and `updateTag()` work only in Server Actions.
   - `revalidateTag(tag)` without a profile is deprecated.
   - Segment `dynamic`/`revalidate`/`fetchCache` are removed.

   See §1.
10. Use `class="dark"` on `<html>` in this dark-only app: shadcn components carry `dark:` utilities, for example `dark:bg-input/30`. See §2.3.

---

## 1. Next.js 16.4

### 1.1 `proxy.ts` (renamed from middleware)

**Imports**
```ts
import { NextResponse, type NextRequest } from "next/server"
// optional shorthand: import type { NextProxy } from "next/server"
```

**Minimal correct usage** — `src/proxy.ts` (this repo uses `src/`):
```ts
import { NextResponse, type NextRequest } from "next/server"
import { readSessionToken } from "@/lib/session-token" // jose wrapper, see §9

const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/sso"] // adjust to the real public routes

export async function proxy(request: NextRequest) {
  // Gate document/RSC navigations only. Server Actions are POSTs and must check auth themselves.
  if (request.method !== "GET" && request.method !== "HEAD") return NextResponse.next()

  const { pathname, search } = request.nextUrl
  const onAuthPage = AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  const session = await readSessionToken(request.cookies.get("session")?.value)

  if (!session && !onAuthPage) {
    const url = new URL("/login", request.url)
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }
  if (session && onAuthPage) return NextResponse.redirect(new URL("/", request.url))
  return NextResponse.next()
}

export const config = {
  // constants only: the matcher is statically analysed
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|ico|txt|xml|woff2?)$).*)"],
}
```

**Facts**
- Put `proxy.ts` "in the project root, or inside `src` if applicable, so that it is located at the same level as `pages` or `app`." In this repo that means `src/proxy.ts`. — [src: NEXT 03-api-reference/03-file-conventions/proxy.md L23; …/src-folder.md "If you're using Proxy, ensure it is placed inside the src folder"]
- The file must export a single function, either `export function proxy` or a default export. Multiple proxy functions in one file are not supported. Only one `proxy.ts` per project. — [src: NEXT proxy.md L56-58; 01-getting-started/16-proxy.md L37]
- `config.matcher` takes a string, an array, or objects `{ source, has, missing, locale }`. `source` must start with `/` and uses path-to-regexp. Matcher values must be constants, because dynamic values are ignored. — [src: NEXT proxy.md L71-137]
- With no matcher, Proxy runs on every request, including `_next/static`, `_next/image` and `public/` assets. Auth redirects can then block CSS, JS and images. — [src: NEXT proxy.md L75]
- Proxy runs on the Node.js runtime by default. `runtime` is not available in Proxy, and setting it throws. — [src: NEXT proxy.md L253-255; version table L806 "v16.0.0 Middleware is deprecated and renamed to Proxy. Proxy defaults to the Node.js runtime"]
- Server Functions are not separate routes. They are POSTs to the route that uses them, so a matcher that excludes a path also skips Server Function calls on it. "Always verify authentication and authorization inside each Server Function rather than relying on Proxy alone." — [src: NEXT proxy.md L249-251]
- Request cookies are read with `request.cookies.get/getAll/has` (plus `delete`/`clear`). Response cookies are written with `response.cookies.set/get/getAll/delete` on a `NextResponse`. — [src: NEXT proxy.md L344-381]
- `fetch` caching options (`cache`, `next.revalidate`, `next.tags`) have no effect in Proxy. Proxy is meant for optimistic checks, not full session management. — [src: NEXT 01-getting-started/16-proxy.md L29-31]
- `import "server-only"` is allowed in Proxy: in the Proxy ("Middleware") context, Turbopack aliases `server-only` to the empty module. A session helper marked `server-only` can therefore be imported here. — [src: TP-SRC crates/next-core/src/next_import_map.rs (match on `ServerContextType::Middleware` → `next/dist/compiled/server-only/empty`)]
- `middleware.ts` is deprecated. Codemod: `npx @next/codemod@canary middleware-to-proxy .` — [src: NEXT proxy.md L11, L787-800]

**Gotchas**
- `cookies()` from `next/headers` is documented for Server Components, Server Functions and Route Handlers only. In Proxy, use `request.cookies`. — [src: NEXT 03-api-reference/04-functions/cookies.md L6]
- Even when Proxy redirects, every Server Action, Route Handler and service still calls `requireUser()` (this repo's rule). The Next docs say the same. — [src: NEXT proxy.md L251; 02-guides/server-actions.md "Security"]

### 1.2 Cache Components rules

**Imports**
```ts
import { Suspense } from "react"
import { cookies, headers } from "next/headers"
import { cacheLife, cacheTag, updateTag, revalidateTag, refresh } from "next/cache"
import { connection } from "next/server"
```

**Minimal correct usage**
```tsx
// src/app/(app)/page.tsx — Server Component
import { Suspense } from "react"
import { cacheLife, cacheTag } from "next/cache"
import { requireUser } from "@/server/auth" // reads cookies() + verifies the JWT (§9)

export default function OverviewPage() {
  return (
    <main>
      <h1>Overview</h1> {/* static → part of the prerendered shell */}
      <Suspense fallback={<PlansSkeleton />}>
        <Plans /> {/* reads cookies → streams at request time */}
      </Suspense>
    </main>
  )
}

async function Plans() {
  const user = await requireUser() // the cookies() read happens *below* the Suspense boundary
  const plans = await getPlans(user.id) // pass a stable id — never the raw token — into the cache
  return <PlanList plans={plans} />
}

// Cached data function: the args become the cache key. It must not read cookies()/headers() itself.
async function getPlans(userId: string) {
  "use cache"
  cacheLife("minutes")
  cacheTag(`plans:${userId}`)
  return db.plans.findMany({ userId })
}
```

**Facts: where `cookies()` may be read**
- Turn the feature on with `cacheComponents: true` together with `partialPrefetching: true`. Set `partialPrefetching` explicitly: leaving it unset logs a warning. Cache Components requires the Node.js runtime. — [src: NEXT 03-api-reference/05-config/01-next-config-js/cacheComponents.md L16-31]
- Runtime APIs are `cookies()`, `headers()`, `searchParams` and `params` (unless `generateStaticParams` covers them). Components that access them should be wrapped in `<Suspense>`. — [src: NEXT 01-getting-started/08-caching.md L158-204]
- "With Cache Components, reading `cookies()` outside a boundary is a build error." — [src: NEXT 02-guides/authentication-with-cache-components.md L117]
- The 16.4.0 error text is: `Route "<route>": Next.js encountered runtime data during prerendering.` followed by `` `cookies()`, `headers()`, `params`, or `searchParams` accessed outside of `<Suspense>` prevents the route from being prerendered … Ways to fix this: [stream] Provide a placeholder with `<Suspense fallback={...}>` … [block] Set `export const instant = false` to allow a blocking route``. Sibling messages exist for "uncached data" and "URL data". — [src: NEXT-SRC dist/server/app-render/blocking-route-messages.js L136-142]
- `cookies()`, `headers()` and `searchParams` are not allowed inside `"use cache"` (or `"use cache: remote"`). The ban follows the call stack, so a helper that reads one fails the same way (`next-request-in-use-cache`). On a dynamic route this "can pass `next build` and fail under `next start`". — [src: NEXT 03-api-reference/01-directives/use-cache.md L239-241]
- Inside `"use cache: private"`, `cookies()`, `headers()` and `searchParams` are allowed, but `connection()` is not. Private results are kept only in the browser, never in a server cache. — [src: NEXT 03-api-reference/01-directives/use-cache-private.md L13-23, L162-173]
- Server Functions (Server Actions) and Route Handlers can read **and** write cookies. `.set` must happen there, because "HTTP does not allow setting cookies after streaming starts". — [src: NEXT cookies.md L6, L71-74]
- A top-level `await` of the session in a **layout** holds the whole segment, including `{children}`, behind the request. Push the read down into a component inside a boundary. — [src: NEXT authentication-with-cache-components.md L156; 08-caching.md L476-532]

**Facts: `use cache` / `cacheLife`**
- Cached functions and components must be `async`. A file-level `"use cache"` caches every export. — [src: NEXT use-cache.md L17, L66]
- The cache key is built from the build ID, the function ID, the serialized arguments, and any closed-over variables. Arguments must be serializable: no class instances, no URL objects, and functions only as pass-through. JSX `children` and Server Actions can be passed through as long as you do not introspect them. — [src: NEXT use-cache.md L79-88, L146-233]
- `React.cache` inside a `use cache` scope is isolated from the outside. Pass data in as arguments. — [src: NEXT use-cache.md L289-315]
- `cacheLife` may only be called inside a cache scope, never at module scope, and only one call may execute per invocation. — [src: NEXT 03-api-reference/04-functions/cacheLife.md L40-50]
- The presets (stale / revalidate / expire) are:

  | Preset | stale | revalidate | expire |
  |---|---|---|---|
  | `default` | 5m | 15m | never |
  | `seconds` | 30s | 1s | 1m |
  | `minutes` | 5m | 1m | 1h |
  | `hours` | 5m | 1h | 1d |
  | `days` | 5m | 1d | 1w |
  | `weeks` | 5m | 1w | 30d |
  | `max` | 5m | 30d | 1y |

  Omitting `cacheLife` applies `default`. — [src: NEXT cacheLife.md L135-147; use-cache.md L349-353]
- Prerender thresholds:
  - `revalidate: 0` or `expire` under 5 minutes makes the result a dynamic hole.
  - `stale` under 30 seconds excludes it from prerenders.
  - `stale` from 30 seconds up to 5 minutes includes it in prerenders but excludes it from the App Shell.

  The client router enforces a minimum stale time of 30 seconds. — [src: NEXT cacheLife.md L250-270]
- A short-lived cache nested inside a `use cache` scope that has no explicit `cacheLife` errors during prerendering. — [src: NEXT cacheLife.md L449-486]
- After a mutation:
  - `updateTag(tag)`: Server Actions only. It expires immediately and gives read-your-own-writes.
  - `revalidateTag(tag, "max")`: stale-while-revalidate; usable in Server Functions and Route Handlers. The single-argument form is **deprecated**.
  - `refresh()`: Server Actions only. It re-renders the current route without invalidating cached data. — [src: NEXT 04-functions/updateTag.md; 04-functions/revalidateTag.md "No second argument (deprecated)"; 04-functions/refresh.md L9-13]
- `Math.random()`, `Date.now()` and `crypto.randomUUID()` during render need either `await connection()` plus `<Suspense>`, or `"use cache"`. `performance.now()` is exempt. — [src: NEXT 08-caching.md L329-389]
- `<Suspense>` alone does not make a component dynamic: purely synchronous work still completes during prerender. — [src: NEXT 08-caching.md L156]
- If promises for runtime data are passed into `use cache`, the build hangs and then fails after 50 s with "Filling a cache during prerender timed out…". — [src: NEXT use-cache.md L689-699]
- `export const instant = false` on a page or layout allows that segment to block. When it is the highest `instant` in the tree, it also opts the route out of static-shell validation. `instant` was stabilised in 16.3. — [src: NEXT 03-api-reference/03-file-conventions/02-route-segment-config/instant.md L67-89, L177]
- With Partial Prefetching, a default `<Link>` prefetches the route's App Shell. Routes that read `cookies()` or `headers()` get a per-session App Shell that is cached on the client. `<Link prefetch={true}>` additionally resolves URL data (`params`, `searchParams`). — [src: NEXT 05-config/01-next-config-js/partialPrefetching.md "How prefetches resolve"; 04-glossary.md "App Shell"]

**Gotchas**
- The placeholder backend is an in-memory store. Prefer uncached service reads behind `<Suspense>`. If you cache per-user data with `use cache`, tag it and call `updateTag` in the mutating action, or users will see stale data. — [src: NEXT 02-guides/server-actions.md "Choosing a cache update"]
- Never put secrets or raw emails in cache arguments or tags: "cache keys and tags are stored in plain text." — [src: NEXT authentication-with-cache-components.md L263]

### 1.3 `ensureStatic` (new in 16.4)

```tsx
// src/app/(auth)/layout.tsx — auth screens read no request data on the server
export const ensureStatic = "navigation"

// src/app/(app)/layout.tsx — the shell (nav, chrome, Suspense fallbacks) must be static; session UI streams
export const ensureStatic = "shell"
```

**Facts**
- `ensureStatic` is exported from a page or layout. Accepted values: `'auto'` (the default), `'shell'`, `'prefetch'`, `'navigation'` and `false`. It needs `cacheComponents`, otherwise the build fails. Exporting it from a Client Component throws. — [src: NEXT 03-file-conventions/02-route-segment-config/ensureStatic.md L14-21, L41-52]
- `'shell'` requires the App Shell loaded by a default `<Link>` to be static. That shell can contain static or cached content and `<Suspense>` fallbacks, while request-specific content behind Suspense renders later. Without Partial Prefetching it does nothing and logs a warning. `'shell'` does **not** make per-link prefetches static. — [src: NEXT ensureStatic.md L54-62]
- `'navigation'` requires the complete server-rendered route to come from prerendering. Next validates it in **both** `next dev` and `next build`. All of the following fail, even inside `<Suspense>` and even with `instant = false`:
  - uncached data and `connection()`
  - `cookies()`, `headers()` and server-side `searchParams`
  - `use cache` with `expire` < 5 min, `stale` < 30 s, or `revalidate` 0
  - a request-dependent promise passed to a Client Component

  The same rules apply to `generateMetadata` and `generateViewport`. — [src: NEXT ensureStatic.md L74-93]
- Under `'navigation'`, Client Components may still use `useSearchParams()`, `useParams()`, `use(browser())` and `use(io())` inside `<Suspense>`. Dynamic routes must export `generateStaticParams` returning complete parameter sets. — [src: NEXT ensureStatic.md L97-111]
- `'shell'` and `'prefetch'` add no build validation. — [src: NEXT ensureStatic.md L82]
- A level set on a layout covers every route that renders that layout, including the layouts above it. A child may be stricter than its parent but not weaker. A weaker child fails with "A child segment cannot override a parent segment with a less-constrained `ensureStatic`." Mixing `false` with a level fails too. — [src: NEXT ensureStatic.md L125-155]
- `ensureStatic` asks for static server output. `instant` validates whether a navigation shows UI immediately. They are independent. — [src: NEXT ensureStatic.md L117-123]

### 1.4 `catchError` + `retry()` (component-level error boundary, stable since 16.3)

```tsx
// src/components/patterns/section-error-boundary.tsx
"use client"

import { catchError, type ErrorInfo } from "next/error"

function SectionErrorFallback(props: { title: string }, { error, retry }: ErrorInfo) {
  // ErrorInfo.error is `unknown` — narrow before reading .message (tsc rejects error.message)
  const detail = error instanceof Error ? error.message : null
  return (
    <div role="alert">
      <p>{props.title} couldn't load.</p>
      {detail && process.env.NODE_ENV !== "production" && <pre>{detail}</pre>}
      <button type="button" onClick={() => retry()}>Try again</button>
    </div>
  )
}

export const SectionErrorBoundary = catchError(SectionErrorFallback)

// usage in a Server Component:
// <SectionErrorBoundary title="Subscriptions">
//   <Suspense fallback={<Skeleton />}><Subscriptions /></Suspense>
// </SectionErrorBoundary>
```

**Facts**
- `catchError(fallback)` returns a component that wraps its `children` in an error boundary. The fallback is called as `fallback(props, errorInfo)`, where `props` are the wrapper's props minus `children`. It must be a Client Component, or defined in a `'use client'` module. — [src: NEXT 03-api-reference/04-functions/catchError.md L106-148]
- `ErrorInfo` is `{ error: unknown; reset: () => void; retry: () => void }`. — [src: NEXT-SRC dist/client/components/error-boundary.d.ts L3-7; RUN tsc: `error.message` → TS18046 "'error' is of type 'unknown'"]
- `retry()` re-fetches and re-renders the boundary's children inside a Transition. `reset()` only clears the error state, without re-fetching, so it "won't recover from Server Component errors". Use `retry()`. — [src: NEXT catchError.md L17, L124-127, L200-202]
- `redirect()` and `notFound()` are not caught. The error state clears when you client-navigate to a different route. — [src: NEXT catchError.md L18-19]
- Errors thrown in Server Components arrive in production with a generic message and an `error.digest`, so show your own copy, not `error.message`. — [src: NEXT 03-file-conventions/error.md L104-115]
- You do not need to wrap `error.js` default exports with `catchError`. — [src: NEXT catchError.md L343]

### 1.5 `error.tsx` / `global-error.tsx` / `not-found.tsx` signatures

```tsx
// src/app/(app)/error.tsx
"use client"
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <button type="button" onClick={() => retry()}>Try again</button>
}

// src/app/global-error.tsx — replaces the root layout when active; must render its own <html>/<body>
"use client"
import "./globals.css"
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en" className="dark">
      <body>
        <h2>Something went wrong</h2>
        <button type="button" onClick={() => retry()}>Try again</button>
      </body>
    </html>
  )
}

// src/app/not-found.tsx — no props; Server Component by default (may be async)
import Link from "next/link"
export default function NotFound() {
  return <Link href="/">Back to overview</Link>
}
```

**Facts**
- `error.js` must be a Client Component. Its props are `error` (`Error & { digest?: string }`), `retry()` and `reset()`. `retry` became stable in 16.3, replacing `unstable_retry`. — [src: NEXT error.md L20-51, L117-157, L327-336]
- `error.js` wraps `loading`, `not-found`, `page` and nested layouts of its segment, but **not** the `layout.js`/`template.js` above it in the same segment. — [src: NEXT error.md L96]
- `global-error` must define `<html>` and `<body>` and bring its own global styles and fonts. It does not get your global styles or theme class. `metadata`/`generateMetadata` are not supported there; use React `<title>` instead. — [src: NEXT error.md L161-167]
- `not-found.js` takes no props. The root `app/not-found.js` also handles every unmatched URL. Before streaming starts the status is 404; after streaming starts it stays 200, but `<meta name="robots" content="noindex">` is injected either way. — [src: NEXT 03-file-conventions/not-found.md L13-15, L133-135]
- The default not-found UI follows `prefers-color-scheme`, not your app theme. Provide your own `not-found.tsx`. — [src: NEXT not-found.md L47]

### 1.6 Server Actions + `useActionState` + `redirect(…, RedirectType.replace)` + `refresh()`

```ts
// src/app/(auth)/login/actions.ts
"use server"

import { cookies } from "next/headers"
import { redirect, RedirectType } from "next/navigation"
import * as z from "zod"

const LoginSchema = z.object({
  email: z.string({ error: "Enter your email address." }).trim().min(1, { error: "Enter your email address." })
    .pipe(z.email({ error: "Enter a valid email address." })),
  password: z.string({ error: "Enter your password." }).min(7, { error: "Password must be at least 7 characters." }),
})

export type LoginState = { fieldErrors?: { email?: string[]; password?: string[] }; formError?: string; email?: string }

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") })
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, email: String(formData.get("email") ?? "") }
  }
  const token = await authenticate(parsed.data) // your service; return { formError } on bad credentials
  const cookieStore = await cookies()
  cookieStore.set("session", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 })
  redirect("/", RedirectType.replace) // outside any try/catch; `never` → no return needed
}
```
```tsx
// src/app/(auth)/login/login-form.tsx
"use client"

import { useActionState } from "react"
import { login, type LoginState } from "./actions"

const initialState: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)
  return (
    <form action={formAction}>
      <input name="email" type="email" defaultValue={state.email} aria-invalid={!!state.fieldErrors?.email} />
      {state.fieldErrors?.email?.[0] && <p role="alert">{state.fieldErrors.email[0]}</p>}
      <input name="password" type="password" />
      <button type="submit" disabled={pending}>Sign in</button>
    </form>
  )
}
```
```ts
// refresh() — Server Actions only: re-render the current route after changing state that isn't in the cache
"use server"
import { refresh } from "next/cache"
export async function rotateKey(id: string) {
  await requireUser()
  await keys.rotate(id)
  refresh()
}
```

**Facts**
- `useActionState(action, initialState)` returns `[state, formAction, pending]`. The Server Function then receives `(prevState, formData)`. — [src: NEXT 02-guides/forms.md L190-249; 01-getting-started/07-mutating-data.md L339-375]
- `redirect(path, type)`:
  - The default type is `push` in Server Actions and `replace` everywhere else.
  - `RedirectType` is exported from `next/navigation`.
  - `redirect` throws `NEXT_REDIRECT` (its type is `never`), so call it **outside** `try/catch`.
  - In a Server Action with JS enabled it performs a client navigation. A progressively enhanced form submission gets a 303. — [src: NEXT 04-functions/redirect.md L10-55, L110, L215]
- Code after `redirect` never runs, so put `revalidatePath`/`updateTag` **before** it. — [src: NEXT server-actions.md L72; 07-mutating-data.md L504]
- A single action response carries both the return value and a re-rendered RSC payload when the action calls `updateTag`/`revalidatePath`/`refresh`, mutates cookies, or redirects. `revalidateTag` with a SWR profile does not trigger the re-render. — [src: NEXT server-actions.md L36-74]
- Next dispatches Server Actions one at a time per client, so do not `Promise.all` them from the client. — [src: NEXT server-actions.md L26-30]
- Built-in protections: a CSRF Origin-vs-Host check, a 1 MB body limit, and encrypted action IDs. Multi-instance deploys need a stable `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`. You must still authenticate, authorise and validate inside every action. — [src: NEXT server-actions.md L76-95]
- `refresh()` can **only** be called from Server Actions, not from Route Handlers or Client Components, and it does not revalidate tagged data. — [src: NEXT 04-functions/refresh.md L9-13; 07-mutating-data.md L421]

**Gotchas**
- The Next forms guide still shows zod v3 APIs (`invalid_type_error`, `error.flatten()`). With zod 4, use `{ error }` and `z.flattenError()`; see §8. — [src: NEXT forms.md L139-160 vs ZOD v4/changelog.mdx]
- Activity keeps the login page mounted after you navigate away, so stale `useActionState` results can reappear. `useActionState` has no setter, so the §1.19 setter-in-cleanup pattern does not carry over directly. Give the action passed to `useActionState` a reset branch that returns the initial state for a sentinel payload such as `null` (`login` as written would call `formData.get` on it), and call `startTransition(() => formAction(null))` from the `useLayoutEffect` cleanup, because dispatching outside a transition errors. Alternatively, remount the form with a `key`. — [src: NEXT 02-guides/preserving-ui-state.md L182-230 (L230: "If you use `useActionState`, the same approach applies. See Reset state in the React docs for how to add a `RESET` action to your reducer"); react.dev/reference/react/useActionState "My state doesn't reset" ("`useActionState` doesn't provide a built-in reset function")]

### 1.7 `cookies().set` / `.delete` in actions and route handlers

```ts
"use server"
import { cookies } from "next/headers"
import { redirect, RedirectType } from "next/navigation"

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  redirect("/login", RedirectType.replace)
}
```
```ts
// src/app/auth/sign-out/route.ts — prefer POST for state-changing requests
import { cookies } from "next/headers"
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
  return Response.json({ ok: true })
}
```

**Facts**
- `cookies()` is async and must be awaited (or read with `use`). The methods are `get`, `getAll`, `has`, `set(name, value, options)`, `delete(name)` and `toString()`. — [src: NEXT cookies.md L32-41, L67]
- `set` options: `name`, `value`, `expires`, `maxAge` (seconds), `domain`, `path` (defaults to `'/'`, the only default), `secure`, `httpOnly`, `sameSite` (`boolean | 'lax' | 'strict' | 'none'`), `priority` and `partitioned`. — [src: NEXT cookies.md L43-61]
- `.delete` works only in a Server Function or Route Handler, and only for the same domain and protocol that set the cookie. Alternatives are `set(name, "")` and `maxAge: 0`. — [src: NEXT cookies.md L71-73, L221-295]
- Setting or deleting a cookie in a Server Action re-renders the current page and its layouts on the server. Client state is kept, and effects re-run if their dependencies changed. — [src: NEXT 07-mutating-data.md L508-512; cookies.md L85-89]

**Gotchas**
- Do not expose sign-out as a GET that you link to with `<Link>`, because Partial Prefetching prefetches visible links. Use a Server Action or a form POST. (Design advice built on [src: NEXT 02-guides/adopting-partial-prefetching.md / partialPrefetching.md "How prefetches resolve"].)

### 1.8 Route handlers under Cache Components

**Facts**
- `GET` handlers follow the same prerender model as pages:
  - If a handler touches no uncached or runtime data, it is prerendered at build.
  - Prerendering stops on network or DB calls, async FS, `req.url`/`request.headers`/`request.cookies`/`request.body`, `cookies()`/`headers()`/`connection()`, or non-deterministic operations.
  - `"use cache"` cannot sit directly in the handler body; extract it to a helper.

  — [src: NEXT 01-getting-started/15-route-handlers.md L87-144]
- Supported methods are GET, POST, PUT, PATCH, DELETE, HEAD and OPTIONS. OPTIONS is auto-implemented. A `route.ts` cannot sit at the same segment as a `page.tsx`. — [src: NEXT 15-route-handlers.md L39-43; 03-file-conventions/route.md "HTTP Methods"]
- `RouteContext<'/path/[id]'>` is a global, generated type helper. `ctx.params` is a Promise. — [src: NEXT route.md "Route Context Helper"]
- **With Cache Components, the segment configs `dynamic`, `dynamicParams`, `revalidate` and `fetchCache` are removed.** The `route.md` examples that still show `export const dynamic`/`revalidate` describe the previous model. — [src: NEXT 03-file-conventions/02-route-segment-config/index.md (Version History v16.0.0)]
- `refresh()` and `updateTag()` cannot be used in Route Handlers. `revalidateTag(tag, profile)` can. — [src: NEXT refresh.md L13; updateTag.md "Usage"; revalidateTag.md "Usage"]

### 1.9 Typed routes

```ts
// next.config.ts
const nextConfig: NextConfig = { typedRoutes: true /* … */ }
```
```tsx
import type { Route } from "next"
import Link from "next/link"

<Link href="/subscriptions" />                 // ✓ literal, validated
<Link href="/subscriptions?plan=ghost" />      // ✓ static route + ?query/#hash suffix
<Link href={`/deployments/${id}`} />           // ✓ template literal — only if a dynamic route like deployments/[id] exists
<Link href={("/deployments/" + id) as Route} /> // non-literal strings (concatenation, variables) need `as Route`
<Link href="/subscriptons" />                  // ✗ TS2820 "Did you mean '/subscriptions'?"

function NavItem<T extends string>({ href }: { href: Route<T> }) { return <Link href={href}>…</Link> }
const nav: { href: Route; label: string }[] = [{ href: "/", label: "Overview" }]
```

**Facts**
- Enable typed routes with `typedRoutes: true`; it is stable, so not under `experimental`. It needs TypeScript. The generated types live in `.next/types`, which must be in `tsconfig` `include` (it already is). They are produced by `next dev`, `next build` or `next typegen`, and this repo's `typecheck` script runs `next typegen`. — [src: NEXT 05-config/01-next-config-js/typedRoutes.md; 05-config/02-typescript.md "Statically Typed Links"]
- The generated `RouteImpl<T>` is the union of:
  - `StaticRoutes`
  - `` `?${string}` `` and `` `#${string}` ``
  - `` `${string}:${string}` `` (any URL with a protocol, so `https:` and `mailto:` type-check)
  - static routes with a `?`/`#` suffix
  - matched dynamic routes

  `<Link href>` accepts `RouteImpl | UrlObject`. `redirect()`, `permanentRedirect()`, `useRouter().push/replace/prefetch` and `next/form` `action` use the same type. — [src: NEXT-SRC dist/server/lib/router-utils/typegen.js L256-406]
- Verified: `redirect("/nope")` errors with TS2345, a mistyped `<Link>` href errors with TS2820, and `https://…`, `mailto:…` and `/x?tab=y` all pass. — [src: RUN next typegen + tsc in scratch]
- Route groups are stripped: `(auth)/login/page.tsx` types as `"/login"`. — [src: RUN generated .next/types/routes.d.ts]

**Gotchas**
- Project rule: external and `mailto:` links are plain `<a>`, even though `<Link>` would type-check them. — [src: AGENTS.md "Conventions"]
- Routes that only exist via Proxy rewrites or redirects need `as Route`. — [src: NEXT 02-typescript.md L272-289]

### 1.10 Route groups

**Facts**
- A `(folderName)` directory is for organisation only and is not part of the URL. Use groups to share a layout among some routes, or to define multiple root layouts. — [src: NEXT 03-file-conventions/route-groups.md]
- Caveats:
  - Navigating between routes that use **different root layouts** triggers a full page reload.
  - Two groups that resolve to the same path (`(a)/x`, `(b)/x`) error.
  - With multiple root layouts and no top-level `layout.js`, `/` must live inside a group.

  — [src: NEXT route-groups.md "Caveats"]
- Recommendation for this repo: keep one root `src/app/layout.tsx` (fonts, `<html class="dark">`, providers), with `(auth)` and `(app)` as nested group layouts. That avoids full reloads between login and the dashboard. — [src: NEXT route-groups.md "Full page load"]

### 1.11 `metadata` + `viewport` exports

```tsx
// src/app/layout.tsx (Server Component)
import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: { template: "%s · Legba", default: "Legba" }, // a default is required with a template
  description: "Legba customer dashboard",
}

export const viewport: Viewport = {
  themeColor: "#0b0b0c",          // single value: the app is dark-only
  colorScheme: "dark",
  viewportFit: "cover",           // needed for env(safe-area-inset-*)
  interactiveWidget: "resizes-content",
  // never set maximumScale / userScalable (project rule: never disable zoom)
}
```
The resulting meta tag is `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`.

**Facts**
- `metadata`/`viewport` objects, or the `generateMetadata`/`generateViewport` functions, may only be exported from Server Components. You cannot export both `viewport` and `generateViewport` from the same segment. — [src: NEXT 04-functions/generate-viewport.md L15-19]
- The `Viewport` type includes:
  - `width`, `height`, `initialScale`, `minimumScale`, `maximumScale`, `userScalable`
  - `viewportFit?: 'auto' | 'cover' | 'contain'`
  - `interactiveWidget?: 'resizes-visual' | 'resizes-content' | 'overlays-content'`
  - `themeColor`: a string, a `{ media, color }` object, or an array of them
  - `colorScheme`: `'normal' | 'light' | 'dark' | 'light dark' | 'dark light' | 'only light'`

  — [src: NEXT-SRC dist/lib/metadata/types/extra-types.d.ts L45-54; metadata-interface.d.ts (Viewport); metadata-types.d.ts L36]
- The defaults `width=device-width, initial-scale=1` are always merged in. Your keys override per key, and the order of the output tag is fixed. — [src: NEXT-SRC dist/lib/metadata/default-metadata.js `createDefaultViewport`; metadata-elements.js `createViewportElements`; NEXT generate-metadata.md "Default Fields"]
- `themeColor` and `colorScheme` inside `metadata` are deprecated (since 14); put them in `viewport`. — [src: NEXT 04-functions/generate-metadata.md "themeColor"/"colorScheme"]
- `title.template` applies to **child** segments, and `title.default` is required when you use a template. — [src: NEXT generate-metadata.md "template"]
- Under Cache Components, a `generateViewport` that reads runtime data blocks the page, because the viewport cannot stream. Prefer the static `viewport` object. — [src: NEXT generate-viewport.md L179-240]

### 1.12 File-convention icons

**Facts**
- These go in `app/` (this repo: `src/app/`):
  - `favicon.ico`: root `app/` only.
  - `icon.(ico|jpg|jpeg|png|svg)` and `apple-icon.(jpg|jpeg|png)`: allowed in any segment.

  Next adds the `<link rel="icon">` / `<link rel="apple-touch-icon">` tags with `type` and `sizes` taken from the file. — [src: NEXT 03-file-conventions/01-metadata/app-icons.md L15-60]
- Multiple icons use numbered names (`icon1.png`, `icon2.png`, …), which sort lexically. SVGs, or files whose size cannot be determined, get `sizes="any"`. — [src: NEXT app-icons.md L62-68]
- Icons can also be generated from code (`icon.tsx`/`apple-icon.tsx` with `ImageResponse` from `next/og`). Generated icons are static unless they use request-time APIs. You cannot generate a `favicon`. — [src: NEXT app-icons.md L70-172]
- This repo already has `src/app/icon1.png`, `icon2.png`, `icon3.png` and `apple-icon.png`. Do not add metadata `icons` for the same files. — [src: repo tree]

### 1.13 `next/font/google` with CSS variables

```ts
// src/app/fonts.ts — call each loader once and import the objects wherever needed
import { JetBrains_Mono, Montserrat } from "next/font/google"

export const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat", display: "swap" })
export const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" })
```
```tsx
// src/app/layout.tsx
import { jetbrainsMono, montserrat } from "./fonts"
import "./globals.css"

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${montserrat.variable} ${jetbrainsMono.variable} dark antialiased`}>
      <body>{children}</body>
    </html>
  )
}
```
```css
/* src/app/globals.css */
@theme inline {
  --font-sans: var(--font-montserrat);
  --font-mono: var(--font-jetbrains-mono);
  --font-heading: var(--font-montserrat); /* shadcn's DialogTitle/AlertDialogTitle use `font-heading` */
}
```

**Facts**
- `Montserrat` and `JetBrains_Mono` are variable fonts, so `weight` is optional. Montserrat's `wght` axis runs 100–900 and JetBrains Mono's 100–800. Montserrat subsets: cyrillic, cyrillic-ext, latin, latin-ext, vietnamese. JetBrains Mono also has greek. — [src: NEXT-SRC dist/compiled/@next/font/dist/google/font-data.json + index.d.ts L7391, L9999]
- Options: `display` defaults to `'swap'` and `preload` defaults to `true`. `subsets` are preloaded when `preload` is true. `variable` declares the CSS variable you name. `adjustFontFallback` defaults to `true` for Google fonts. — [src: NEXT 03-api-reference/02-components/font.md L146-234]
- Every call creates a separate font instance, so define fonts once in a module and import them elsewhere. — [src: NEXT font.md "Using a font definitions file"]
- The documented Tailwind v4 wiring: put the `.variable` classes on `<html>`, then map them in `@theme inline { --font-sans: var(--font-…) }`. — [src: NEXT font.md "With Tailwind CSS" L746-850]

**Gotchas**
- Apply the `.variable` classes to **`<html>`**, not `<body>`. Tailwind emits `--default-font-family: var(--font-montserrat)` and the preflight `font-family` on `:root`/`html`, so the variable must be defined on that element. — [src: RUN tailwind compile (@layer theme `:root, :host { --default-font-family: var(--font-montserrat) }`)]
- Avoid the shadcn-init line `--font-sans: var(--font-sans)`. It is fragile; see §2.2. — [src: RUN]
- `shadcn init` does not touch `layout.tsx`; it only rewrites `globals.css`. Font wiring is therefore manual. The create-next-app scaffold used Geist; check that no Geist import remains. — [src: SH-CLI scratch run diff]

### 1.14 `next/image` (`preload` vs `fetchPriority`, `fill`, `sizes`, `qualities`)

```tsx
import Image from "next/image"

<Image src="/hero.png" alt="" width={720} height={480} fetchPriority="high" loading="eager" />  // LCP image
<div className="relative aspect-video">
  <Image src={cover} alt="Plan cover" fill sizes="(max-width: 768px) 100vw, 480px" className="object-cover" />
</div>
```

**Facts**
- `priority` is **deprecated** (16.0) in favour of `preload`. `preload` inserts a `<link rel="preload">` in `<head>`. "In most cases, you should use `loading="eager"` or `fetchPriority="high"` instead of `preload`." Do not combine `preload` with `loading` or `fetchPriority`. — [src: NEXT 03-api-reference/02-components/image.md L266-294; NEXT-SRC dist/shared/lib/get-img-props.d.ts L23-28]
- `loading` defaults to `lazy`. Unknown props such as `fetchPriority` pass through to `<img>` (except `srcSet`). — [src: NEXT image.md L296-310, L469-473]
- `fill`:
  - The parent must be `position: relative`, `fixed` or `absolute`.
  - The image is absolutely positioned.
  - Without `sizes`, the srcset assumes `100vw` and uses `deviceSizes` only.

  Always pass `sizes` with `fill`. — [src: NEXT image.md L115-135, L199-232]
- `images.qualities` is an allow-list; the default is `[75]` since 16.0. A `quality` outside the list is coerced to the closest allowed value, and the raw API returns 400 for others. This repo sets `[60, 75, 90]`. — [src: NEXT image.md L234-245, L699-729; repo next.config.ts]
- `src` ending in `.svg` is served unoptimized automatically. Prefer inline SVG components for icons. — [src: NEXT image.md L923-944]
- `width`/`height` are required unless the image is statically imported or uses `fill`. — [src: NEXT image.md L100-113]

### 1.15 `next/script` with `beforeInteractive`

```tsx
// src/app/layout.tsx only
import Script from "next/script"
<Script id="early-flags" strategy="beforeInteractive">{`document.documentElement.dataset.js = "1"`}</Script>
```
**Facts**
- `beforeInteractive` scripts must be placed in a **root layout**. They are injected into the initial HTML and downloaded before any Next.js module, but "their execution does not block page hydration". — [src: NEXT 03-api-reference/02-components/script.md L68-110]
- The strategies are `beforeInteractive`, `afterInteractive` (the default), `lazyOnload` and `worker` (experimental). — [src: NEXT script.md L59-66]
- Inline scripts must have an `id`. — [src: NEXT 02-guides/scripts.md L237-258]
- For DOM fixes that must run before first paint, the docs also describe a plain inline `<script>` with `suppressHydrationWarning`. — [src: NEXT 02-guides/preventing-flash-before-hydration.md]

### 1.16 `allowedDevOrigins`

```ts
const nextConfig: NextConfig = { allowedDevOrigins: ["127.0.0.1", "192.168.1.23", "*.tunnel.example.com"] }
```
**Facts**
- Dev resources (`/_next/*`, `/__nextjs*`) are allowed by default only from `localhost`, `**.localhost`, and the hostname the dev server was started with. Anything else gets a 403 "Blocked cross-origin request to Next.js dev resource". `/_next/image` and static media are exempt. — [src: NEXT-SRC dist/server/lib/router-utils/block-cross-site-dev.js L79-96; NEXT 05-config/01-next-config-js/allowedDevOrigins.md]
- Entries are **hostnames only**, with no scheme or port. `*` matches exactly one label, and `**` (only at the start) matches one or more. Partial wildcards such as `team-*.x` are not supported. — [src: NEXT allowedDevOrigins.md]

**Gotchas**
- `127.0.0.1` and LAN IPs used for phone testing are **not** allowed by default. Add them, or HMR and RSC dev requests fail. — [src: NEXT-SRC block-cross-site-dev.js L79-86]

### 1.17 `useSelectedLayoutSegment` under Cache Components

```tsx
"use client"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"
export function NavLink({ segment, href, children }: { segment: string | null; href: "/" | "/subscriptions"; children: React.ReactNode }) {
  const active = useSelectedLayoutSegment() === segment
  return <Link href={href} aria-current={active ? "page" : undefined}>{children}</Link>
}
// In the layout: wrap the nav in <Suspense fallback={<StaticNav />}> if ANY child route has an
// unknown dynamic param (not covered by generateStaticParams); otherwise no Suspense is needed.
```
**Facts**
- It returns the active segment **one level below** the calling layout, or `null`. Catch-all routes return the joined string. — [src: NEXT 03-api-reference/04-functions/use-selected-layout-segment.md L6-67]
- No Suspense is needed for static routes or routes covered by `generateStaticParams`. For dynamic params not covered, the hook **suspends**. Wrap it in `<Suspense>`, otherwise the build fails. This holds "even when the component that calls `useSelectedLayoutSegment` is itself static". — [src: NEXT use-selected-layout-segment.md L69-80]

### 1.18 `useSearchParams` + Suspense

```tsx
<Suspense fallback={<FilterBarSkeleton />}>
  <FilterBar /> {/* "use client"; calls useSearchParams() */}
</Suspense>
```
**Facts**
- On a prerendered route, `useSearchParams` makes the client tree up to the nearest Suspense boundary render on the client. Wrap the component in `<Suspense>`; without it the production build fails ("Missing Suspense boundary with useSearchParams"). In dev it seems to work without one, because routes render on demand. — [src: NEXT 03-api-reference/04-functions/use-search-params.md L78-185]
- Alternatively, in a Server Component page, pass the `searchParams` prop down (it is a Promise) and unwrap it with `use()` behind Suspense. — [src: NEXT use-search-params.md "Good to know"]

### 1.19 Activity (preserving UI state)

```tsx
"use client"
import { useLayoutEffect, useState } from "react"
export function UserMenu() {
  const [open, setOpen] = useState(false)
  useLayoutEffect(() => () => setOpen(false), []) // reset when Activity hides this route
  /* … */
}
```
**Facts**
- With Cache Components, Next keeps previous routes in React `<Activity mode="hidden">` instead of unmounting them, hidden with `display: none`. Up to **3 routes** are preserved, and older ones are evicted. — [src: NEXT 02-guides/preserving-ui-state.md L17-19; cacheComponents.md L47-61]
- Hiding cleans up effects and showing re-creates them. React state and DOM state survive: inputs, scroll, `<details>`, and `useActionState` results. — [src: NEXT cacheComponents.md L51-57; preserving-ui-state.md L144-230]
- Reset transient UI (menus, popovers, one-time secrets) in a `useLayoutEffect` cleanup, or close it via `<Link onNavigate>`. — [src: NEXT preserving-ui-state.md L35-72]
- On logout, `window.location.href = …` does a full reload that clears all client state. Alternatively, key user-scoped components by user id. — [src: NEXT preserving-ui-state.md L253-281]
- Hidden content stays in the DOM, and `<video>`/`<audio>` keep playing. E2E tests should use visibility-aware queries such as `getByRole`/`getByLabel`, or `.filter({ visible: true })`. — [src: NEXT preserving-ui-state.md L353-389, L495-516]
- `useRouter().bfcacheId` can be used as a key to reset a subtree on push/replace. — [src: NEXT preserving-ui-state.md L21]

---

## 2. Tailwind CSS 4.3

### 2.1 `@tailwindcss/turbopack` configuration (already in `next.config.ts`)

```ts
// next.config.ts
turbopack: {
  rules: {
    "*.css": {
      loaders: ["@tailwindcss/turbopack"], // or [{ loader: "@tailwindcss/turbopack", options: { base: process.cwd(), optimize: true } }]
      as: "*.css",
    },
  },
},
```
```css
/* src/app/globals.css */
@import "tailwindcss";
```

**Facts**
- This is the documented setup for the package. There are two options:
  - `base`: the directory scanned for class candidates; defaults to `process.cwd()`.
  - `optimize`: `boolean | { minify?: boolean }`; defaults to `true` in production.

  No PostCSS config is needed. — [src: TWT README.md "Usage"/"Options"; dist/index.d.ts]
- The loader runs on every matched `*.css`, including `*.module.css`. A file containing none of `@import|@reference|@theme|@variant|@config|@plugin|@apply|@tailwind` passes through **unchanged**. The aicss `Orb.module.css` is one such file. — [src: TWT dist/index.js (the "Quick bail check" regex)]
- To use `@apply` or `@variant` inside a CSS module, add `@reference "<path>/globals.css";` at its top. The reference pulls in your theme without duplicating CSS. — [src: TW functions-and-directives.mdx "@reference"]
- Tailwind's changelog lists `@tailwindcss/turbopack` under "Unreleased: Add `@tailwindcss/turbopack` package to run Tailwind CSS with Next.js". npm has a single non-insiders release, 4.3.3, published 2026-07-31. — [src: TW-CL "Unreleased"; npm `view @tailwindcss/turbopack time`]
- The Next 16.4 Turbopack docs still say "Loaders that transform files like stylesheets … are not currently supported". That is contradicted by this package. A production build of this repo at 06:43 (`.next/static/chunks/*.css`) contains Tailwind-generated utilities, so it works. — [src: NEXT 05-config/01-next-config-js/turbopack.md "Configuring webpack loaders"; repo .next build output]

### 2.2 `@theme` and `@theme inline` tokens

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

:root {
  /* dark-only token values (raw), consumed via @theme inline below */
  --background: #0b0b0c;
  --foreground: #f5f5f5;
  --primary: #e5484d;
  /* … */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --font-sans: var(--font-montserrat);
  --font-mono: var(--font-jetbrains-mono);
  --font-heading: var(--font-montserrat);
}

@theme {
  --text-display: 3rem;                    /* → text-display utility */
  --text-display--line-height: 1.1;
  --text-display--letter-spacing: -0.02em;
  --radius-card: 1rem;                     /* → rounded-card */
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1); /* → ease-out-quint */
}
```

**Facts**
- `@theme` defines design tokens in namespaces. For example, `--color-*` feeds bg/text colours, `--font-*` font-family utilities, `--text-*` font sizes, `--font-weight-*`, `--tracking-*`, `--leading-*`, `--radius-*`, `--shadow-*`, `--ease-*`, `--animate-*`, `--breakpoint-*` and `--container-*`. — [src: TW theme.mdx "Theme variable namespaces"]
- Use `@theme inline` when a token references another variable. The utility then inlines the value (`.font-sans { font-family: var(--font-montserrat) }`) instead of `var(--font-sans)`. That avoids resolution at the wrong element. — [src: TW theme.mdx "Referencing other variables"; RUN compile]
- A font size can carry defaults: `--text-x--line-height`, `--text-x--letter-spacing` and `--text-x--font-weight`. The utility emits them as `line-height: var(--tw-leading, var(--text-x--line-height))`. — [src: TW font-size.mdx "Customizing your theme"; RUN compile]
- To reset a namespace use `--color-*: initial`, or `--*: initial` for everything. By default only the variables you use are emitted; use `@theme static` to emit all of them. — [src: TW theme.mdx "Overriding the default theme", "Generating all CSS variables"]

**Gotcha (verified)**
- After `shadcn init`, `@theme inline` contains `--font-sans: var(--font-sans);`. Tailwind 4.3.3 then emits `@layer theme { :root, :host { --font-sans: var(--font-sans); --default-font-family: var(--font-sans); } }`, which is a self-referencing custom property.
  - It is harmless only while an **unlayered** rule also sets `--font-sans` on the **same element**. In this repo, next/font's `.…_variable{--font-sans:"Montserrat", …}` class is on `<html>`, and unlayered declarations beat `@layer theme`. The current `.next/static/chunks/*.css` contains both rules.
  - If that class moves to `<body>`, or a non-next/font variable is used, `--font-sans` on `:root` resolves to a cycle (invalid), and `html { font-family: var(--font-sans) }` falls back.
  - Distinct names (`--font-sans: var(--font-montserrat)`) remove the hazard.

  — [src: SH-CLI scratch run (globals.css diff); RUN compile of that globals.css; repo .next build CSS; CSS Cascade 5 (unlayered beats layered)]

### 2.3 `@custom-variant`: class-based `dark`, and `hover` gated on a fine pointer

```css
/* written by shadcn init; keep it — dark: variants then key off the .dark class */
@custom-variant dark (&:is(.dark *));

/* project rule: hover only for real hover-capable fine pointers. Overrides `hover:` (and therefore group-hover:/peer-hover:) */
@custom-variant hover {
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      @slot;
    }
  }
}
```
**Facts**
- `@custom-variant name (selector);` is the shorthand form. The block form uses `@slot` and can nest `@media`. — [src: TW adding-custom-styles.mdx "Adding custom variants"; functions-and-directives.mdx "@custom-variant"]
- Out of the box, v4's `hover:` applies only under `@media (hover: hover)`. You can redefine it with `@custom-variant hover …`. — [src: TW upgrade-guide.mdx "Hover styles on mobile"]
- Verified output:
  - `.hover\:bg-x:hover` is emitted inside `@media (hover: hover) and (pointer: fine)`.
  - `group-hover:` moves into the same media query.
  - `dark:` compiles to `:is(.dark *)`.

  — [src: RUN @tailwindcss/node 4.3.3 compile]
- `dark` defaults to `prefers-color-scheme`. Switch it to a class with `@custom-variant dark (&:where(.dark, .dark *));`; the docs form also matches the `.dark` element itself. shadcn writes `(&:is(.dark *))`, which matches descendants only, and that is fine with `class="dark"` on `<html>`. — [src: TW dark-mode.mdx "Toggling dark mode manually"; SH-CLI scratch globals.css]
- Built-in variants used by this stack:
  - `pointer-fine`, `pointer-coarse`, `any-pointer-*`
  - `motion-safe`, `motion-reduce`
  - `starting:` (→ `@starting-style`)
  - `data-[x=y]:`, and bare `data-x:` (→ `[data-x]`)
  - `in-data-[…]:`, `not-data-x:`
  - `supports-[…]:`/`supports-backdrop-filter:`

  — [src: TW hover-focus-and-other-states.mdx; RUN compile]

**Gotcha**
- Dark-only means: keep the shadcn `dark:` utilities working by putting `class="dark"` on `<html>`. Without it, classes like `dark:bg-input/30` (Input, Button outline) never apply. Also set `colorScheme: "dark"` in `viewport` (§1.11). — [src: SH-REG input.json/button.json; RUN compile]

### 2.4 Container queries

```tsx
<section className="@container/plans">
  <div className="grid grid-cols-1 @md/plans:grid-cols-2 @3xl/plans:grid-cols-3" />
</section>
```
**Facts**
- `@container` marks an inline-size container, and `@container/{name}` names it. The variants are:
  - `@sm:`, `@md:`, … (mobile-first, min-width)
  - `@max-md:` (below)
  - stacked ranges such as `@sm:@max-md:`
  - `@md/{name}:` (a named container)
  - `@min-[475px]:` (arbitrary)

  — [src: TW responsive-design.mdx "Container queries"]
- Verified sizes: `@sm` is `width >= 24rem`, `@md` is `width >= 28rem`, `@max-md` is `width < 28rem`. Defaults run from `@3xs` (16rem) to `@7xl` (80rem). Custom sizes go in `--container-*`. — [src: RUN compile; TW responsive-design.mdx "Container size reference"]
- `@container-size` (new in 4.3.0) creates a **size** container, which you need for `cqb`/`cqh` units. — [src: TW-CL 4.3.0 "Add `@container-size` utility"; TW responsive-design.mdx "Using size containers"]

### 2.5 `@layer`, `@utility`, `@variant`

```css
@layer base {
  html { color-scheme: dark; }
  button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; } /* what `shadcn init --pointer` adds */
}

@layer components {
  .card-surface { border-radius: var(--radius-card); background: var(--color-card); }
}

@utility press-scale {               /* simple/complex utility; works with variants: hover:press-scale */
  transition: transform 120ms var(--ease-out-quint);
  &:active { transform: scale(0.97); }
}

@utility glow-* {                    /* functional utility: glow-8, glow-12 … */
  box-shadow: 0 0 calc(--value(integer) * 1px) var(--color-primary);
}

.legacy-thing {
  @variant hover { opacity: 0.8; }   /* apply a variant inside custom CSS; 4.3 also allows @variant hover:focus / hover, focus */
}
```
**Facts**
- Use `@layer base` for element defaults and `@layer components` for classes that utilities should be able to override. They are emitted as native cascade layers. — [src: TW adding-custom-styles.mdx "Adding base styles"/"Adding component classes"; RUN compile]
- `@utility` adds to the `utilities` layer and works with all variants. Functional utilities use `--value(--theme-ns-*)`, `--value(integer|number|percentage|ratio)`, `--value("literal")` or `--value([type])`. — [src: TW adding-custom-styles.mdx "Adding custom utilities"]
- Since 4.3.0, `@variant` accepts stacked (`hover:focus`) and compound (`hover, focus`) variants. Since 4.3.1, `@apply` works with CSS mixins. — [src: TW-CL 4.3.0, 4.3.1]
- In v4, `!` (important) works both trailing (`bg-red-500!`) and leading (`!bg-red-500`). — [src: RUN compile]

---

## 3. shadcn CLI 4.21.3 (Base UI, style `base-nova`)

### 3.1 `init` on this existing project

```bash
pnpm dlx shadcn@4.21.3 init --base base --preset nova
# -y is already the default; result: components.json "style": "base-nova", "iconLibrary": "lucide"
```
**Facts (`init --help`, 4.21.3)**
- Flags:
  - `-t, --template <next|start|vite|react-router|laravel|astro>`, used to scaffold new projects
  - `-b, --base <base|radix|aria>`
  - `-p, --preset [name]`
  - `-y, --yes` (default **true**)
  - `-d, --defaults` (= `--template=next --preset=base-nova`)
  - `-f, --force`, `-c, --cwd`
  - `--css-variables` (default true), `--rtl`, `--pointer`, `--monorepo`, `--reinstall`

  `create` is an alias of `init`. — [src: SH-CLI `init --help`]
- The presets bundled in 4.21.3 are `nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera` and `rhea`. Nova is "Lucide / Geist", with `iconLibrary: "lucide"`, `font: "geist"`, `baseColor: "neutral"`, `menuAccent: "subtle"`, `menuColor: "default"`, `radius: "default"`. — [src: SH-CLI dist/index.js preset table]
- **There is no `--icon-library` flag.** The icon library comes from the preset and is written to `components.json` as `iconLibrary`. Change it later with `shadcn migrate icons --from lucide --to <lib>`; supported values are lucide, tabler, hugeicons, phosphor, remixicon and radix (legacy). — [src: SH-CLI `init --help`, `migrate --help`; SH (root)/cli.mdx "migrate icons"]
- Base UI is the default library since July 2026. `-b radix` opts out. — [src: SH changelog/2026-07-base-ui-default.mdx]
- `--pointer` adds `@layer base { button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; } }`. — [src: SH changelog/2026-04-pointer-cursor.mdx]
- `eject` inlines `shadcn/tailwind.css` into your CSS and removes the `shadcn` dependency. It is irreversible. — [src: SH (root)/cli.mdx "eject"]

### 3.2 `components.json` (exactly what 4.21.3 wrote)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "rtl": false,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "menuColor": "default",
  "menuAccent": "subtle",
  "registries": {}
}
```
**Facts**
- The schema's `style` enum covers `{radix|base|aria}-{vega|nova|maia|lyra|mira|luma|sera|rhea}` plus `default` and `new-york`. It also defines:
  - `iconLibrary`: a string
  - `menuColor`: `default | inverted | default-translucent | inverted-translucent`
  - `menuAccent`: `subtle | bold`
  - `rtl`: a boolean
  - `registries`: keys starting with `@`, with values containing `{name}`

  — [src: https://ui.shadcn.com/schema.json (fetched)]
- `style`, `tailwind.baseColor` and `tailwind.cssVariables` cannot be changed after init. For Tailwind v4, `tailwind.config` stays empty. — [src: SH (root)/components-json.mdx]

### 3.3 What `init` wrote (verified diff on a scratch copy of this repo)
- It created `components.json` (above) and `src/lib/utils.ts`, which contains exactly `export { cn } from "cn"`. — [src: SH-CLI scratch run; SH changelog/2026-09-cn.mdx]
- `package.json` `dependencies` gained `@base-ui/react ^1.8.0`, `class-variance-authority ^0.7.1`, `cn ^0.4.0`, `lucide-react ^1.52.0`, `shadcn ^4.21.3` and `tw-animate-css ^1.4.0`. All of them landed in `dependencies`, not `devDependencies`. — [src: SH-CLI scratch run]
- `globals.css` was rewritten. It gained:
  - `@import "tw-animate-css";` and `@import "shadcn/tailwind.css";`
  - `@custom-variant dark (&:is(.dark *));`
  - an `@theme inline` block mapping `--color-{background,foreground,card,popover,primary,secondary,muted,accent,destructive,border,input,ring,chart-1..5,sidebar-*}` to raw variables
  - `--radius-{sm..4xl}` as multiples of `--radius`
  - `--font-sans: var(--font-sans)` and `--font-heading: var(--font-sans)` (self-reference; see §2.2)
  - `:root` (light, oklch, `--radius: 0.625rem`) and `.dark` token blocks
  - `@layer base { * { @apply border-border outline-ring/50 } body { @apply bg-background text-foreground } html { @apply font-sans } }`

  — [src: SH-CLI scratch run diff]
- It printed "Updating fonts" but did **not** modify `layout.tsx`. — [src: SH-CLI scratch run diff]
- `shadcn/tailwind.css` (shipped in the `shadcn` package):
  - defines custom variants `data-open`, `data-closed`, `data-checked`, `data-unchecked`, `data-selected`, `data-disabled`, `data-active`, `data-horizontal`, `data-vertical`; for example `data-open` matches `[data-state="open"]` or `[data-open]:not([data-open="false"])`, and `data-selected` matches only `[data-selected="true"]`
  - defines `accordion-down`/`accordion-up` keyframes
  - defines the `no-scrollbar`, `scroll-fade*` and `shimmer*` utilities

  — [src: shadcn@4.21.3 dist/tailwind.css]

### 3.4 `add`

```bash
pnpm dlx shadcn@4.21.3 add button dialog alert-dialog dropdown-menu select tooltip tabs popover drawer checkbox field command sonner input label skeleton
pnpm dlx shadcn@4.21.3 add button --dry-run   # also: --diff, --view
pnpm dlx shadcn@4.21.3 docs dialog            # prints docs/examples/Base UI API links for the project's base
```
**Facts**
- `add` flags are `-y`, `-o/--overwrite`, `-c`, `-a/--all`, `-p/--path`, `-s`, `--dry-run`, `--diff [path]` and `--view [path]`. — [src: SH-CLI `add --help`]
- In the scratch run, `add` installed `cmdk ^1.1.1` (for `command`), `sonner ^2.0.8` and **`next-themes ^0.4.6`** (for `sonner`). It also pulled registry dependencies: `separator`, `textarea` and `input-group` (for `field`/`command`), plus `button`. It printed "Remember to wrap your app with the `TooltipProvider` component." — [src: SH-CLI scratch run]
- Every generated component imports `cn` from **`"cn"`**, not `@/lib/utils`. — [src: SH-REG button.json; SH changelog/2026-09-cn.mdx "Registry components, blocks and examples import cn from cn instead of @/lib/utils"]
- `button.tsx`, `input.tsx`, `skeleton.tsx` and `textarea.tsx` have **no** `"use client"`, so `buttonVariants` can be called in Server Components. Base UI's component modules start with `'use client'` (see §4). The interactive wrappers (dialog, alert-dialog, dropdown-menu, select, tooltip, tabs, popover, drawer, checkbox, field, command, sonner, toast, label) start with `"use client"`. — [src: SH-CLI scratch files; BUI package `button/Button.mjs` line 1]

### 3.5 Base UI `render` prop vs Radix `asChild`

```tsx
// ✓ Base UI / shadcn base-nova
<DialogTrigger render={<Button variant="outline" />}>Open</DialogTrigger>
<DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Account" />}><UserIcon /></DropdownMenuTrigger>
<TooltipTrigger render={<Button size="icon-sm" aria-label="Copy key" />}><CopyIcon /></TooltipTrigger>
// rendering a non-<button> element from a trigger/close that defaults to <button>:
<Tabs.Tab value="overview" nativeButton={false} render={<Link href="/" />}>Overview</Tabs.Tab>
// ✗ never: <DialogTrigger asChild>…</DialogTrigger>
```
**Facts**
- Base UI composes with `render`, which takes a React element or `(props, state) => element`. A custom component used there must forward the `ref` and spread all received props onto its DOM node. Nested `render` props are allowed, for example Tooltip→Dialog→Menu triggers. — [src: BUI handbook/composition.md]
- shadcn's migration rule is: "Replace `asChild` with `render`", and "Mechanical things get fixed everywhere (`asChild` is now `render`)". — [src: SH components/base/drawer.mdx "Replace asChild with render"; changelog/2026-07-base-ui-default.mdx]
- Parts that render a `<button>` by default take `nativeButton`, which defaults to `true`. Set `nativeButton={false}` when `render` produces a non-button. Examples: `Tabs.Tab` rendered as `<Link>`, `Dialog.Trigger`/`Dialog.Close`. `Menu.Item` defaults to `nativeButton: false` and renders a `<div>`. — [src: BUI components/dialog.md (Trigger/Close props); tabs.md "Links"; menu.md (Item props)]
- `className` and `style` also accept a function of the component's state. — [src: BUI handbook/styling.md]

### 3.6 `buttonVariants` with `<Link>` / `<a>`

```tsx
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

<Link href="/subscriptions" className={buttonVariants({ variant: "outline", size: "sm" })}>Manage</Link>
<Link href="/" className={cn(buttonVariants({ variant: "ghost" }), "justify-start")}>Overview</Link>
<a href="mailto:support@legba.xyz" className={buttonVariants({ variant: "link" })}>Contact support</a>
```
**Facts**
- "**Do not use `<Button render={<a />} nativeButton={false} />` for links.** The Base UI `Button` component always applies `role="button"`, which overrides the semantic link role on `<a>` elements. Use `buttonVariants` with a plain `<a>` tag instead." — [src: SH components/base/button.mdx "As Link"; example apps/v4/examples/base/button-render.tsx]
- `buttonVariants` variants are `default | outline | secondary | ghost | destructive | link`. Sizes are `default | xs | sm | lg | icon | icon-xs | icon-sm | icon-lg`. `buttonVariants({ variant, size, className })` appends `className` last. — [src: SH-REG button.json]
- Icons inside buttons get spacing from `data-icon="inline-start"` / `"inline-end"`. — [src: SH components/base/button.mdx "With Icon"]

### 3.7 Required post-`add` edits for this project
- `sonner.tsx`:
  - Replace `const { theme = "system" } = useTheme()` with a fixed `theme="dark"`, then drop the `next-themes` dependency.
  - Replace `loading: <Loader2Icon className="size-4 animate-spin" />` with the orb (`<Spinner />`). That is required by the project rule "only loading indicator is the orb".
  - It ships `toastOptions.classNames.toast = "cn-toast"` and maps sonner CSS vars to `--popover`/`--popover-foreground`/`--border`/`--radius`.

  — [src: SH-CLI scratch sonner.tsx; AGENTS.md]
- `toast.tsx` is shadcn's **Base UI** toast, a different API from sonner (`toast.add(…)`, from `createToastManager()`). Install either `toast` or `sonner`, not both: both export a `Toaster`, and toast.tsx also renders `Loader2Icon animate-spin`. — [src: SH-CLI scratch toast.tsx; SH changelog/2026-07-toast.mdx]
- `tabs.tsx` exports `Tabs`, `TabsList` (variants `default | line`), `TabsTrigger`, `TabsContent` and `tabsListVariants`. It has **no** `Tabs.Indicator`. For a sliding indicator, render `TabsPrimitive.Indicator` yourself; see §4. — [src: SH-CLI scratch tabs.tsx]
- `tooltip.tsx`'s `TooltipProvider` defaults `delay={0}`. Mount it once in the root layout. — [src: SH-CLI scratch tooltip.tsx]
- `field.tsx` is a **layout** kit, not a wrapper around Base UI `Field`: plain `<div role="group">`, `<fieldset>`, `<legend>`, `FieldError` with `role="alert"`. `FieldError` accepts `errors: Array<{ message?: string } | undefined>`. — [src: SH-CLI scratch field.tsx]
- `drawer.tsx` wraps the Base UI **Drawer** (not vaul). Its props are `swipeDirection` (default `"down"`, not `direction`) and `showSwipeHandle`, and snap points are supported. — [src: SH-CLI scratch drawer.tsx; SH components/base/drawer.mdx migration notes]
- `skeleton.tsx` uses `animate-pulse`, which is allowed: it is not a spinner. — [src: SH-CLI scratch skeleton.tsx]

---

## 4. Base UI 1.8.0 (`@base-ui/react`)

**Shared rules**
- Import each component from its subpath, e.g. `import { Dialog } from "@base-ui/react/dialog"`, and use the namespaced parts (`Dialog.Root`, `Dialog.Popup`, …). The package was renamed from `@base-ui-components/react`. — [src: BUI every component page header]
- Every component-part module starts with `'use client'` (for example `button/Button.mjs` and `dialog/root/DialogRoot.mjs`), so all parts are Client Components. Not every file has the directive: barrel `index` files and non-component helpers do not, including `toast/createToastManager.mjs`, the `createHandle` modules (`*/store/*Handle.mjs`, `*/handle.mjs`), `merge-props` and `use-render`. In 1.8.0, 410 of 796 `.mjs` files have no directive. — [src: BUI package files (`head -1` of each `.mjs`)]
- Animation:
  - CSS transitions use `[data-starting-style]` (the state you transition from) and `[data-ending-style]` (the state you transition to). They are recommended because a transition can be cancelled mid-way.
  - CSS keyframe animations use `[data-open]`/`[data-closed]`.
  - Base UI waits for `element.getAnimations()` to finish before unmounting.

  — [src: BUI handbook/animation.md]
- The positioned popups (Popover, Menu, Select, Tooltip) expose these CSS variables on `Positioner`, inherited by `Popup`:
  - `--anchor-width`, `--anchor-height`
  - `--available-width`, `--available-height`
  - `--positioner-width`, `--positioner-height`
  - **`--transform-origin`**

  Use `origin-(--transform-origin)` on the Popup. Positioner/Popup also set `data-side` (`top|bottom|left|right|inline-start|inline-end`, plus `none` for Select in align-with-trigger mode) and `data-align` (`start|center|end`). — [src: BUI tooltip.md/popover.md/menu.md/select.md (Positioner CSS Variables)]
- Triggers expose `data-popup-open`. Several also expose `data-pressed` and `data-disabled`. — [src: BUI dialog.md, popover.md, menu.md (Trigger Data Attributes)]
- Tailwind usage pattern from the Base UI docs: `transition-[transform,opacity] data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95`. shadcn base-nova instead uses tw-animate-css keyframes: `data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out …`. — [src: BUI handbook/styling.md "Tailwind CSS"; SH-CLI scratch dialog.tsx]

| Component | Anatomy (parts) | Key props (defaults) | Data attributes / CSS vars | shadcn base-nova wrapper |
|---|---|---|---|---|
| **Dialog** `@base-ui/react/dialog` | `Root > Trigger, Portal > Backdrop, Viewport > Popup > Title, Description, Close` | Root: `open`, `defaultOpen`, `onOpenChange(open, details)`, `modal` (`true`, or `'trap-focus'`/`false`), `disablePointerDismissal` (false), `actionsRef {unmount, close}`, `onOpenChangeComplete`, `handle` (from `Dialog.createHandle()` for detached triggers). Popup: `initialFocus`, `finalFocus` | Backdrop/Popup/Viewport: `data-open`, `data-closed`, `data-starting-style`, `data-ending-style`. Popup: `data-nested`, `data-nested-dialog-open`, `--nested-dialogs` | `Dialog`, `DialogTrigger`, `DialogContent` (Portal + Overlay (=Backdrop) + Popup + optional close `Button`, `showCloseButton=true`), `DialogHeader`, `DialogFooter` (`showCloseButton=false`), `DialogTitle`, `DialogDescription`, `DialogClose`, `DialogOverlay`, `DialogPortal` |
| **AlertDialog** `@base-ui/react/alert-dialog` | same parts as Dialog | Root: `open`, `defaultOpen`, `onOpenChange`, `actionsRef`, `handle`. No `modal` or `disablePointerDismissal` (it "requires a user response") | same as Dialog | `AlertDialogContent` (`size: "default" \| "sm"`), `AlertDialogHeader/Footer/Media/Title/Description`, `AlertDialogAction` (a plain `Button`; does **not** close by itself), `AlertDialogCancel` (= `AlertDialog.Close render={<Button variant="outline"/>}`) |
| **Menu** `@base-ui/react/menu` | `Root > Trigger, Portal > Backdrop, Positioner > Popup > Arrow, Item, LinkItem, Separator, Group > GroupLabel, RadioGroup > RadioItem > RadioItemIndicator, CheckboxItem > CheckboxItemIndicator, SubmenuRoot > SubmenuTrigger` | Root: `modal` (true), `loopFocus` (true), `highlightItemOnHover` (true), `orientation` ('vertical'). Trigger: `openOnHover`, `delay` (100). Item: `onClick`, `closeOnClick` (**true**), `label`, `nativeButton` (false). **`LinkItem` renders `<a>` with `closeOnClick` (false)**. CheckboxItem/RadioItem: `closeOnClick` (false) | Item: `data-highlighted`, `data-disabled`. Checkbox/Radio items: `data-checked`/`data-unchecked`. Popup: `data-instant`. Positioner vars as above | `DropdownMenu*` (Content has `align="start"`, `sideOffset=4`; Item has `variant: "default" \| "destructive"` and `inset`). **`DropdownMenuLabel` = `Menu.GroupLabel` → must be inside `DropdownMenuGroup`/`RadioGroup`, otherwise it throws "MenuGroupContext is missing"**. There is no LinkItem wrapper: use `<MenuPrimitive.LinkItem render={<Link href=… />} closeOnClick>` |
| **Select** `@base-ui/react/select` | `Root > Label, Trigger > Value, Icon; Portal > Backdrop, Positioner > Popup > ScrollUpArrow, Arrow, List > Item > ItemText, ItemIndicator; Separator; Group > GroupLabel; ScrollDownArrow` | Root: `items` (makes `<Select.Value>` render labels; otherwise it renders the **raw value**), `value`/`defaultValue`/`onValueChange`, `multiple`, `name` (hidden input for forms), `modal` (true), `required`, `disabled`, `readOnly`. Value: `placeholder`. Positioner: `alignItemWithTrigger` (**true**; disabled for touch; `side`/`align` ignored while active) | Trigger: `data-popup-open`, `data-placeholder`, `data-valid`/`data-invalid`/… Item: `data-selected`, `data-highlighted`, `data-disabled`. Popup `data-side="none"` in align mode | `Select` (= `SelectPrimitive.Root`), `SelectTrigger` (`size: "sm" \| "default"`), `SelectValue`, `SelectContent` (`alignItemWithTrigger=true`; animations off when aligned), `SelectItem`, `SelectGroup`, `SelectLabel` (GroupLabel), `SelectSeparator` |
| **Tooltip** `@base-ui/react/tooltip` | `Provider > Root > Trigger, Portal > Positioner > Popup > Arrow, Viewport` | **Provider**: `delay`, `closeDelay`, `timeout` (**400** — another tooltip opens *instantly* if the previous one closed within this window). Trigger: `delay` (600), `closeDelay` (0), `closeOnClick` (true), `disabled`. Root: `disableHoverablePopup`, `trackCursorAxis`. Positioner `side` defaults to `'top'` | Popup: `data-open/closed/starting-style/ending-style`, `data-side`, `data-align`, **`data-instant` (`'delay' \| 'dismiss' \| 'focus'`)** → style with `data-instant:transition-none` | `TooltipProvider` (`delay=0`), `Tooltip`, `TooltipTrigger`, `TooltipContent` (Portal + Positioner(`side="top"`, `sideOffset=4`) + Popup + Arrow) |
| **Tabs** `@base-ui/react/tabs` | `Root > List > Tab, Indicator; Panel` | Root: `value`/`defaultValue` (default `0`; set an explicit enabled value for SSR), `onValueChange(value, details)`, `orientation`. List: `activateOnFocus` (false), `loopFocus` (true). Tab: `value`, `disabled`, `nativeButton`. Panel: `value`, `keepMounted` (false) | Tab: **`data-active`**, `data-disabled`, `data-orientation`, `data-activation-direction`. Panel: `data-hidden`, `data-starting-style`/`data-ending-style`. **Indicator** vars: `--active-tab-left/right/top/bottom/width/height`; Indicator prop `renderBeforeHydration` | `Tabs`, `TabsList` (`variant: default \| line`), `TabsTrigger` (= Tab), `TabsContent` (= Panel). No Indicator wrapper |
| **Popover** `@base-ui/react/popover` | `Root > Trigger, Portal > Backdrop, Positioner > Popup > Arrow, Viewport > Title, Description, Close` | Root: `modal` (**false**), `open`/`onOpenChange`, `actionsRef`. Trigger: **`openOnHover`** (false), `delay` (300), `closeDelay` (0). Use it for info-tips that must work on touch | Popup: `data-instant` (`'click' \| 'dismiss' \| 'focus' \| 'trigger-change'`), `--popup-width/height` | `PopoverContent` (`side="bottom"`, `align="center"`, `sideOffset=4`), `PopoverHeader`, `PopoverTitle`, `PopoverDescription` |
| **Drawer** `@base-ui/react/drawer` | `Provider > IndentBackground, Indent > Root > Trigger, SwipeArea, Portal > Backdrop, Viewport > Popup > Content > Title, Description, Close` | Root: `swipeDirection` (`'down'`), `snapPoints`, `snapPoint`/`onSnapPointChange`, `snapToSequentialPoints`, `modal` (true), `disablePointerDismissal`. Add `data-base-ui-swipe-ignore` to opt an element out of swipe. `Drawer.VirtualKeyboardProvider` handles bottom sheets with inputs | Popup: `data-swipe-direction`, `data-swiping`, `data-expanded`, `data-nested-drawer-open`, `--drawer-height`, `--drawer-swipe-movement-x/y`, `--drawer-swipe-strength`, `--drawer-snap-point-offset`. Backdrop: `--drawer-swipe-progress` | `Drawer` (`swipeDirection="down"`, `showSwipeHandle`), `DrawerContent` (Portal + Overlay + Viewport + Popup + Content), header/footer/title/description |
| **Toast** `@base-ui/react/toast` | `Provider > Portal > Viewport > Root > Content > Title, Description, Action, Close` (anchored: `Positioner > Root > Arrow …`) | Provider: `limit` (3), `timeout` (5000), `toastManager`. `Toast.createToastManager()` → `{ add, close, update, promise }`; `Toast.useToastManager()` → `{ toasts, … }`. Root: `toast`, `swipeDirection` (`['down','right']`). F6 jumps to the viewport | Root: `data-type`, `data-expanded`, `data-limited`, `data-swipe-direction`, `data-swiping`, `data-starting-style`/`data-ending-style`; vars `--toast-index`, `--toast-offset-y`, `--toast-height`, `--toast-swipe-movement-x/y`. Viewport: `--toast-frontmost-height`. Content: `data-behind` | shadcn `toast.tsx`: `Toaster`, `toast` (a manager), `useToastManager`, `ToastAction/Close/…`. **Not used if you choose sonner** |
| **Checkbox** `@base-ui/react/checkbox` | `Root > Indicator` | Root: `checked`/`defaultChecked`/`onCheckedChange(checked, details)`, `indeterminate`, `name`, `value` (submits `value`, or `"on"` when it has none), `uncheckedValue`, `required`, `disabled`, `readOnly`, `nativeButton` (**false** → renders `<span>` plus a hidden input). Indicator: `keepMounted` | `data-checked`/`data-unchecked`, `data-indeterminate`, `data-disabled`, `data-invalid`, `data-focused`, … | `Checkbox` (Root + Indicator with a lucide `CheckIcon`) |
| **Field** `@base-ui/react/field` | `Root > Label, Control, Description, Item, Error, Validity` | Root: `name` (wins over Control's), `validate(value, formValues)`, `validationMode` (`'onSubmit'`, or `'onBlur'`/`'onChange'`), `validationDebounceTime` (0), `invalid`/`dirty`/`touched` (external control), `disabled`. Error: `match` (`true` or a ValidityState key such as `'valueMissing'`). The `Form` component takes an `errors={{ field: msg \| msg[] }}` prop (works with `useActionState`) | Root/Error: `data-valid`, `data-invalid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`, `data-disabled`. Error: `data-starting-style`/`ending-style` | **None**: shadcn `field.tsx` is unrelated markup (see §3.7) |

[src: BUI components/{dialog,alert-dialog,menu,select,tooltip,tabs,popover,drawer,toast,checkbox,field,form}.md "Anatomy" and "API reference"; handbook/forms.md "Server-side validation"; SH-CLI scratch components; BUI-SRC menu/group/MenuGroupContext.js (error text)]

**Snippets**
```tsx
// Sliding tab indicator (not provided by shadcn's tabs.tsx)
"use client"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
<TabsPrimitive.List className="relative flex gap-1">
  <TabsPrimitive.Tab value="ghost" className="px-3 py-1.5 data-active:text-foreground">Ghost</TabsPrimitive.Tab>
  <TabsPrimitive.Tab value="shield" className="px-3 py-1.5 data-active:text-foreground">Shield</TabsPrimitive.Tab>
  <TabsPrimitive.Indicator className="absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-primary transition-[translate,width] duration-200 ease-out" />
</TabsPrimitive.List>
```
```tsx
// Menu link item inside a shadcn DropdownMenu (closes the menu so Activity doesn't preserve it open)
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>Account</DropdownMenuLabel>
    <MenuPrimitive.LinkItem closeOnClick render={<Link href="/api-keys" />} className="…">API keys</MenuPrimitive.LinkItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

---

## 5. `cn` 0.4.0

**Imports / API**
```ts
import { cn, twMerge, twJoin, clsx, type ClassValue } from "cn"          // runtime, default tables
import { createCn, createTwMerge, extendTailwindMerge, fromTheme, validators, defaultConfig, mergeConfigs } from "cn/config"
import { clsx } from "cn/lite"                                            // strings-only join (clsx/lite parity)
import { withCn } from "cn/next"                                          // build-time tables (optional)
```
```ts
// src/lib/utils.ts — what shadcn init writes
export { cn } from "cn"
```
```ts
// src/lib/utils.ts — if the theme defines custom --text-* (or --radius-*, --shadow-*, --leading-*, --tracking-*) names
import { createCn } from "cn/config"
export const cn = createCn({
  extend: { theme: { text: ["display", "label"], radius: ["card"] } }, // or classGroups: { "font-size": [{ text: ["display"] }] }
})
```

**Facts**
- `cn(...inputs)` takes clsx-style arguments (strings, arrays, objects, falsy values) and resolves conflicts like tailwind-merge. It is "a drop-in replacement for `twMerge(clsx(...))`", supports Tailwind v4 only, and has zero dependencies. — [src: CN README.md; dist/index.d.ts]
- `cn/config` exports `createCn(ext?)`, which accepts tailwind-merge's `{ extend, override, prefix }` shape, a `(config) => config` transform, or a full config. Compilation is lazy, costing about 3 ms on the first call. It also exports `createTwMerge`, `extendTailwindMerge`, `fromTheme`, `validators`, `defaultConfig()` and `mergeConfigs`. The theme scale keys are `animate, aspect, blur, breakpoint, color, container, drop-shadow, ease, font, font-weight, inset-shadow, leading, perspective, radius, shadow, spacing, text, text-shadow, tracking`. — [src: CN dist/config.d.ts]
- Default merge behaviour, verified with cn 0.4.0:
  - custom **colours** merge correctly (`bg-surface` vs `bg-red-500`)
  - an **unknown `text-*` name is treated as a colour**: `cn("text-display","text-white")` → `"text-white"`, and in cva `cn(v({ className: "text-display" }))` drops `text-primary-foreground`
  - custom `rounded-card`/`shadow-panel`/`leading-*`/`tracking-*` names don't conflict with built-ins, so both classes stay
  - t-shirt-style names (`text-2xs`), arbitrary values (`text-[13px]`) and `text-(length:--x)` merge correctly as font sizes

  With `createCn({ extend: { theme: { text: ["display"] } } })`, `text-display` merges as a font size. — [src: RUN node with cn@0.4.0 + class-variance-authority@0.7.1]
- `cn build` / `withCn(nextConfig, { content, out })` (`cn/next`) / the `cn/vite` plugin generate project-fitted tables (`createCn(tables)` from `cn/engine`). The table file is regenerated when `next dev`/`next build` starts. `@theme` scales in your CSS are baked in, but `--color-*`/`--font-*` are skipped because any name is already accepted there. It is optional: "If you're unsure whether you need `cn build`, you don't." The build only applies to code that imports the generated `cn`. — [src: shadcn-ui/cn docs/build-setup.md]
- `shadcn migrate cn` rewrites `clsx`/`tailwind-merge`/`cnfast` imports and removes the old packages. Dependencies that still import them can be aliased with `turbopack.resolveAlias: { clsx: "cn", "tailwind-merge": "cn" }`, as this repo's `next.config.ts` already does. Default imports (`import clsx from "clsx"`) do not resolve through the alias. — [src: SH (root)/cli.mdx "migrate cn"; shadcn-ui/cn docs/aliasing.md]

**Gotcha**
- shadcn components import `cn` from `"cn"`, which uses the default tables. A `createCn` instance in `@/lib/utils` therefore does **not** affect them. If you pass custom `text-*` classes into shadcn components, either change those components to `import { cn } from "@/lib/utils"` or use t-shirt/arbitrary names. Project rule: never import `clsx`/`tailwind-merge`. — [src: SH-REG button.json; RUN; AGENTS.md]

---

## 6. sonner 2.0.8

**Imports**
```ts
import { Toaster, toast, useSonner, type ToasterProps, type ExternalToast } from "sonner"
```
**Toaster (dark-only, orb as loader, mobile safe-area)**
```tsx
"use client"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Spinner } from "@/components/ui/spinner"

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      mobileOffset={{ bottom: "calc(16px + env(safe-area-inset-bottom))" }}
      icons={{ loading: <Spinner /> }}
      toastOptions={{ classNames: { toast: "cn-toast", description: "text-muted-foreground" } }}
      {...props}
    />
  )
}
```
**`toast()` API**
```ts
toast("Saved")
toast.success("Key created", { description: "Copy it now — it won't be shown again." })
toast.error("Couldn't load deployments")
toast("Deployment stopped", { action: { label: "Undo", onClick: () => restart(id) } }) // click closes the toast; event.preventDefault() keeps it open
const id = toast.loading("Rotating key…"); /* … */ toast.success("Rotated", { id })    // update in place
toast.dismiss(id)

toast.promise(rotateKey(id), {
  loading: "Rotating key…",
  success: (data) => `Rotated ${data.name}`,               // or ({ message: "Rotated", description: "…" })
  error: (err) => (err instanceof Error ? err.message : "Couldn't rotate the key"),
})
```

**Facts**
- `ToasterProps` include:
  - `theme`: `'light' | 'dark' | 'system'`, default **`'light'`**
  - `position`: one of 6, default `'bottom-right'`
  - `hotkey`: default `['altKey','KeyT']`
  - `expand`, `richColors`, `visibleToasts` (3), `gap` (14), `closeButton`, `duration`
  - `offset` and **`mobileOffset`**: `number | string | {top,right,bottom,left}`; numbers become px; the defaults are 24px and 16px; `mobileOffset` applies below 600px
  - `icons` (`success | info | warning | error | loading | close`)
  - `toastOptions` (`className`, `classNames`, `style`, `duration`, `unstyled`, `closeButton`, …)
  - `swipeDirections`, `dir`, `id`, `containerAriaLabel` ("Notifications")

  — [src: SON dist/index.d.ts (ToasterProps); dist/index.mjs Toaster defaults, VIEWPORT_OFFSET='24px', MOBILE_VIEWPORT_OFFSET='16px', `@media (max-width: 600px)`]
- The `toastOptions.classNames` keys are `toast, title, description, loader, closeButton, cancelButton, actionButton, success, error, info, warning, loading, default, content, icon`. — [src: SON dist/index.d.ts (ToastClassnames)]
- `toast` has these members: `toast(msg, data?)` plus `.success/.info/.warning/.error/.loading/.message/.custom(jsx)/.promise/.dismiss(id?)/.getHistory/.getToasts`. `toast()`, `.success`…`.loading`, `.message`, `.custom` and `.dismiss` return the toast id (`string | number`). `.promise` returns an object with `unwrap()`. — [src: SON dist/index.d.ts]
- `toast.promise(promise | () => promise, { loading, success, error, description, finally })`:
  - `success`/`error` may be strings, nodes, functions of the result or error, or objects (`{ message, …ExternalToast }`); the field is `message`, not `title`.
  - It returns an object with `unwrap()`.
  - A resolved **non-OK `fetch` Response** is shown as an error with `HTTP error! status: <n>`.

  — [src: SON dist/index.d.ts (PromiseData); dist/index.mjs `this.promise`]
- `ExternalToast` options include `description`, `duration` (4000), `id`, `icon` (`null` removes it), `action`/`cancel` (`{ label, onClick }` or a node), `dismissible` (true), `onDismiss`, `onAutoClose`, `closeButton`, `position`, `unstyled`, `classNames`, `richColors`, `invert` and `toasterId`. — [src: SON dist/index.d.ts (ToastT/ExternalToast); sonner.emilkowal.ski/toast "API Reference"]
- Styles are injected at runtime (`__insertCSS`), so no CSS import is needed. Overriding with `classNames` requires `!important` unless you use `unstyled`. — [src: SON dist/index.mjs; sonner.emilkowal.ski/styling]

**Discrepancy**
- The website says the default desktop offset is 32px, but the 2.0.8 source uses `'24px'`. The source wins. — [src: sonner.emilkowal.ski/toaster vs SON dist/index.mjs]

---

## 7. cmdk 1.1.1

**Imports**
```ts
import { Command, useCommandState, defaultFilter } from "cmdk"
// Command.Input / .List / .Empty / .Group / .Item / .Separator / .Loading / .Dialog
```
**Usage via shadcn `command.tsx` (Base UI dialog + cmdk root)**
```tsx
"use client"
import { useEffect, useState } from "react"
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useRouter } from "next/navigation"

export function CommandMenu() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return // cmdk's own ctrl+k ("previous item") already handled it
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen((o) => !o) }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [])
  return (
    <CommandDialog open={open} onOpenChange={setOpen} title="Command menu" description="Search pages and actions" className="duration-0">
      {/* required: CommandDialog does not create the cmdk root */}
      <Command>
        <CommandInput placeholder="Search…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Go to">
            <CommandItem value="subscriptions" keywords={["plans", "billing"]} onSelect={() => { setOpen(false); router.push("/subscriptions") }}>
              Subscriptions
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
```
**Facts**
- Parts, and the attributes you style them by:
  - `Command` `[cmdk-root]`: props `label`, `shouldFilter`, `filter(value, search, keywords) → 0..1`, `value`/`onValueChange`, `defaultValue`, `loop`, `disablePointerSelection`, `vimBindings` (default **true**)
  - `Input` `[cmdk-input]`: `value`/`onValueChange`
  - `List` `[cmdk-list]`: `--cmdk-list-height`
  - `Item` `[cmdk-item]`: `value`, `keywords`, `onSelect(value)`, `disabled`, `forceMount`
  - `Group` `[cmdk-group]`: `heading`; hidden with `[hidden]`, never unmounted
  - `Separator` (`alwaysRender`), `Empty`, `Loading`
  - `Dialog` `[cmdk-dialog]`/`[cmdk-overlay]`: Radix Dialog

  — [src: CMDK README.md; dist/index.d.ts]
- Keyboard handling, as implemented in 1.1.1:
  - ↓/↑ move to the next/previous item.
  - ⌘↓/⌘↑ jump to the last/first item, and ⌥↓/⌥↑ jump to the next/previous group.
  - Home/End go to the first/last item.
  - Enter runs the selected item's `onSelect`.
  - With `vimBindings`, Ctrl+N/J and Ctrl+P/K also move next/previous; these call `preventDefault()`.
  - IME composition is ignored.
  - The ⌘K opener is your job.

  — [src: CMDK dist/index.mjs (root onKeyDown); README "Listen for ⌘K automatically? No"]
- Items render `data-selected="true"|"false"` and `data-disabled="true"|"false"`, booleans stringified. Style them with `data-[selected=true]:` or shadcn's `data-selected:` custom variant. Tailwind's bare `data-selected:` would also match `"false"`. — [src: CMDK dist (`"data-selected":!!R`); shadcn@4.21.3 dist/tailwind.css]
- Item `value` is inferred from `textContent` when omitted. Values are trimmed, and items need a stable unique `value` and a `key`. Performance is good up to roughly 2,000–3,000 items; there is no virtualization. — [src: CMDK README "Item", FAQ]
- shadcn's `CommandDialog` is **shadcn's Base UI `Dialog`** (an `sr-only` `DialogHeader` plus a `DialogContent` that receives `className`) that renders `children` as-is. It does **not** create a cmdk `Command`, so wrap `CommandInput`/`CommandList` in `<Command>` yourself, as shadcn's own example does. cmdk parts rendered outside a `Command` root throw `TypeError: Cannot read properties of undefined (reading 'subscribe')`. Its props are `title`/`description` (rendered `sr-only`) and `showCloseButton` (false). It does not use `Command.Dialog`. `CommandInput` sits in an `InputGroup` with a search icon. `CommandItem` appends a `CheckIcon` that shows when `data-checked=true`. The other exports are `Command`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandSeparator` and `CommandShortcut`. — [src: SH-CLI scratch command.tsx (same as repo src/components/ui/command.tsx); shadcn-ui/ui apps/v4/examples/base/command-basic.tsx (`<CommandDialog …><Command><CommandInput …/>`); RUN renderToString with cmdk@1.1.1: parts without a root throw, parts inside `Command` render]
- cmdk primitives accept `asChild` (Radix Slot). Do not use it, because the repo grep-gate forbids `asChild`. — [src: CMDK dist/index.d.ts; AGENTS.md]
- Project rule: no open/close animation for keyboard-triggered UI (⌘K).
  - shadcn's `DialogContent` animates (`duration-100 data-open:animate-in …`). The tw-animate-css keyframes read `var(--tw-animation-duration, var(--tw-duration, .15s))`, so passing `className="duration-0"` to `CommandDialog` collapses the popup animation. `cn` resolves the conflict with `duration-100`, and Tailwind's `duration-0` emits `--tw-duration: 0ms`.
  - The overlay (`DialogOverlay`) keeps its own 100 ms fade unless you edit `dialog.tsx` or `command.tsx`.

  — [src: AGENTS.md; SH-CLI scratch dialog.tsx; RUN tailwind compile of `duration-0` and the shadcn globals.css (`animate-in`)]

---

## 7b. A note on `next-themes`
- Only shadcn's `sonner.tsx` uses it. The app is dark-only, so remove the import and the dependency once `sonner.tsx` uses `theme="dark"`. — [src: SH-CLI scratch run]

---

## 8. zod 4 (4.6.5)

```ts
import * as z from "zod"

export const LoginSchema = z.object({
  email: z
    .string({ error: "Enter your email address." })       // custom message when the field is missing/null
    .trim()
    .min(1, { error: "Enter your email address." })
    .pipe(z.email({ error: "Enter a valid email address." })),
  password: z
    .string({ error: "Enter your password." })
    .min(7, { error: "Password must be at least 7 characters." })
    .max(128, { error: "Password is too long." }),
})
export type LoginInput = z.infer<typeof LoginSchema>

const result = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") })
if (!result.success) {
  const { formErrors, fieldErrors } = z.flattenError(result.error) // { formErrors: string[]; fieldErrors: { email?: string[]; password?: string[] } }
  const tree = z.treeifyError(result.error)                       // { errors: string[]; properties?: { email?: { errors: string[] } } }
}
```
**Facts**
- String formats are top-level: `z.email()`, `z.url()`, `z.uuid()`, `z.jwt()`, …. The method forms such as `z.string().email()` still work but are **deprecated**. — [src: ZOD api.mdx "String formats"; v4/changelog.mdx "deprecates .email() etc"]
- Every API takes a custom error as a string or as `{ error }`. `error` may also be a function: `(iss) => iss.input === undefined ? "Required" : "Not a string"`. The v3 `message` param still works but is deprecated. — [src: ZOD error-customization.mdx "The error param"; v4/changelog.mdx "deprecates message parameter"; RUN]
- `safeParse` returns `{ success: true, data } | { success: false, error }`. `error.issues[]` items have `code`, `path` and `message`. — [src: ZOD error-customization.mdx; RUN]
- `z.flattenError(err)` gives `{ formErrors: string[], fieldErrors: Record<field, string[]> }`, for flat schemas. `z.treeifyError(err)` gives `{ errors, properties?, items? }`, for nested ones. `z.prettifyError(err)` gives a readable string. `error.flatten()`/`error.format()`/`z.formatError()` are deprecated. — [src: ZOD error-formatting.mdx; v4/changelog.mdx "deprecates .format()"/".flatten()"]

**Gotchas (verified with 4.6.5)**
- `z.email().trim()` validates **before** trimming: `" a@b.co "` fails. `z.string().trim().pipe(z.email())` succeeds and returns `"a@b.co"`. — [src: RUN]
- A missing `FormData` field yields `null`, which fails with "Invalid input: expected string, received null" unless you pass `z.string({ error })`. — [src: RUN]
- With `.min(1, …)` before `.pipe(z.email())`, a blank input reports only the min message; the pipe never runs. — [src: RUN]
- `z.flattenError(...).fieldErrors` feeds Base UI `<Form errors={…}>` (field → `string[]`) directly. For shadcn `FieldError`, map it to `errors={msgs?.map((message) => ({ message }))}`. — [src: BUI handbook/forms.md "Server-side validation"; SH-CLI scratch field.tsx]

---

## 9. jose 6.2.12 (HS256 session JWT, Node runtime)

```ts
// src/lib/session-token.ts
import "server-only"
import { SignJWT, jwtVerify, errors, type JWTPayload } from "jose"

const ISSUER = "legba-dashboard"
const AUDIENCE = "legba-dashboard"
const secret = () => {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be at least 32 characters") // jose does not enforce this
  return new TextEncoder().encode(s)
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(userId)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("7d")
    .sign(secret())
}

export async function readSessionToken(token: string | undefined): Promise<(JWTPayload & { uid: string }) | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify<{ uid: string }>(token, secret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    })
    return payload
  } catch (e) {
    if (e instanceof errors.JOSEError) return null // expired / bad signature / wrong claims / malformed
    throw e
  }
}
```
**Facts**
- `SignJWT` builds a token: `new SignJWT(payload).setProtectedHeader({ alg }).setIssuedAt().setIssuer().setAudience().setSubject().setExpirationTime(...).sign(key)`. `setExpirationTime` accepts a Unix timestamp in seconds, a `Date`, or a relative string such as `"2h"`, `"7d"` or `"5 minutes"`. — [src: JOSE docs/jwt/sign/classes/SignJWT.md]
- `jwtVerify(jwt, key, options)` resolves to `{ payload, protectedHeader }`. Its options include `algorithms`, `issuer`, `audience`, `subject`, `typ`, `maxTokenAge`, `clockTolerance`, `requiredClaims` and `currentDate`. Setting `issuer`/`audience` requires those claims to be present. — [src: JOSE docs/jwt/verify/functions/jwtVerify.md; interfaces/JWTVerifyOptions.md]
- For HS256 the key is a `Uint8Array`: `new TextEncoder().encode(secret)`. jose is zero-dependency, tree-shakeable ESM, and supports Node.js. — [src: JOSE README.md; SignJWT.md "Usage with a symmetric secret"]
- Verified error classes, all subclasses of `errors.JOSEError`:

  | Case | Class | Code |
  |---|---|---|
  | expired | `JWTExpired` | `ERR_JWT_EXPIRED` |
  | wrong issuer | `JWTClaimValidationFailed` | `ERR_JWT_CLAIM_VALIDATION_FAILED`, `claim: "iss"`, `reason: "check_failed"` |
  | tampered | `JWSSignatureVerificationFailed` | `ERR_JWS_SIGNATURE_VERIFICATION_FAILED` |
  | garbage | `JWSInvalid` | `ERR_JWS_INVALID` |

  — [src: RUN node with jose@6.2.12]
- jose **accepted a 5-byte HS256 secret**. Enforce the ≥32-character `SESSION_SECRET` yourself, as `.env.example` documents. — [src: RUN; repo .env.example]
- Pin `algorithms: ["HS256"]` on verify, so a token cannot choose its own algorithm. — [src: JOSE JWTVerifyOptions.md "algorithms"]

---

## 10. aicss orbs (`kvnkld/aicss` → `packages/react/src/orbs`)

**Source structure** (repo HEAD `3ca50a3611b988d85eac6ffce662369494061674`, 2026-09-30; both orb files last changed in `456d944834d5b647598bcb3d91b2630bfa045fcf`, 2026-08-24)
- Files: `Orb.tsx` (19,666 bytes, sha256 `a088f58e…f43de`), `Orb.module.css` (24,328 bytes, sha256 `7a4c3d28…964662`), and `index.ts` (`export * from "./Orb";`). The package `@aicss/react` 0.1.8 ships source TS with CSS modules. Its README says: "In Next.js add `transpilePackages: ["@aicss/react"]`." Vendoring is simpler, and this repo already vendors it as `src/components/ui/spinner.*`. — [src: AICSS tree; packages/react/README.md, package.json]
- `Orb.tsx` is `"use client"` and exports:
  - the types `OrbVariant`, `LatticeVariant` (S1–S5), `LensVariant` (B1–B5), `RingVariant` (C1–C5), `HelixVariant` (G1–G5), `MorphVariant` (M1–M5)
  - the `*_VARIANTS` arrays
  - `ORB_TASKS` (S1 "Thinking", C3 "Streaming")
  - `OrbProps { variant?, size?, label?, pill?, className?, style? }`
  - `Orb`

  The geometry is authored on a 28px stage (`STAGE = 28`) and scaled with `--orb-k = size / 28`. The default `size` is 20. — [src: AICSS Orb.tsx L1-61, L551-673]
- Accessibility: the glyph is `role="img"` with `aria-label={label ?? ORB_TASKS[variant] + "…"}`. In `pill` mode the glyph is `aria-hidden` and the visible label carries the meaning. — [src: AICSS Orb.tsx L578-588]
- Theme: the CSS module sets the `--orb-*` inks on `:global(:root)` / `[data-theme="light"]`, overrides them under `:global([data-theme="dark"])`/`:global(.dark)`, and uses `prefers-color-scheme` when no `data-theme` is present. With `<html class="dark">`, the dark inks apply. The pill label hard-codes `font-family: "Inter", system-ui, sans-serif`; override it, or don't use `pill`. — [src: AICSS Orb.module.css L12-47, L73-80]
- Turbopack's CSS-module purity lint flags a selector only when **every** top-level component is "problematic". `:global(...)` parses as a single pseudo-class component, which the lint allows, so the `:global(:root)` blocks compile. The Tailwind loader passes this file through untouched (§2.1). — [src: TP-SRC turbopack/crates/turbopack-css/src/process.rs `CssValidator::is_problematic` (L715-746); RUN lightningcss 1.33 visitor shows `:global(:root)` → `{"type":"pseudo-class","kind":"global",…}`]
- `prefers-reduced-motion: reduce` stops all orb animations. Lattice orbs then show only the centre cell (`.cell[data-mid]` at opacity 1), and ring dots sit at opacity 0.7. — [src: AICSS Orb.module.css L851-879]

**S1 (lattice, "wave") — delay formula, verbatim** (`Orb.tsx` L79-81, L95-131)
```tsx
const N = 3; // lattice is N×N
const PITCH = 6; // centre-to-centre spacing in stage px; the dot size is CSS
const MID = (N - 1) / 2;
```
```tsx
/**
 * Per-cell `animation-delay` in ms. Negative values seed a cell partway
 * into its cycle, which is what turns 8 identical animations into one
 * comet travelling the ring.
 */
function cellDelay(v: LatticeVariant, x: number, y: number): number {
  const dx = x - MID;
  const dy = y - MID;
  const ring = Math.max(Math.abs(dx), Math.abs(dy));
  switch (v) {
    // Radiates from the centre on a round wavefront. Centre leads a beat
    // early so the next swell doesn't sit behind the outer fade.
    case "S1":
      return Math.hypot(dx, dy) * 700 - (dx === 0 && dy === 0 ? 180 : 0);
    // A broad band crosses the grid on the diagonal. The spread is close to
    // the wave duration, which both widens the band and makes the sweep
    // continuous - the far corner restarts as the near one does.
    case "S2":
      return ((x + y) / (2 * (N - 1))) * 1500;
    // One head with a decaying tail, running the perimeter clockwise.
    case "S3": {
      const i = RING_INDEX.get(x + "," + y);
      if (i === undefined) return 0;
      return -(((RING.length - i) % RING.length) / RING.length) * 1700;
    }
    // A soft column travels left to right.
    case "S4":
      return (x / (N - 1)) * 1100;
    // Like S3 but scrambled order - the pulse jumps pseudo-randomly.
    case "S5": {
      const i = RING_INDEX.get(x + "," + y);
      if (i === undefined) return 0;
      const scrambled = (i * 3) % RING.length;
      return -(scrambled / RING.length) * 1700;
    }
  }
}
```
Each cell is placed at `left: x * PITCH, top: y * PITCH`, with `animationDelay: c.delay + "ms"` (L591-608). The computed S1 delays (`N=3`, `MID=1`) are: corners `989.9494936611666ms`, edges `700ms`, centre `-180ms`. — [src: AICSS Orb.tsx; RUN node]

**S1 CSS, verbatim** (`Orb.module.css` L94-118, L120-126, L156-178)
```css
.lattice {
  position: absolute;
  left: 0;
  top: 0;
  width: 28px;
  height: 28px;
  transform-origin: 0 0;
  /* Three 3px dots on a 6px pitch measure 15px, so the grid is offset to sit
     centred on the 28px stage. It deliberately does not fill the stage: that
     is what keeps its visual weight level with the Lens circles. */
  transform: scale(var(--orb-k, 1)) translate(6.5px, 6.5px);
  /* Resting ink of an unlit cell - the grid stays legible between beats.
     --orb-dim is for cells sitting a choreography out entirely. */
  --orb-rest: var(--orb-rest-ink, 0.14);
  --orb-dim: var(--orb-dim-ink, 0.07);
}

.cell {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: var(--orb-rest);
}
```
```css
/* One wave shape drives all three sweeps. What separates them is the pair of
   duration and per-cell stagger: the stagger sets how fast the wavefront
   travels, the duration how many cells it holds lit at once - which is to
   say, how wide the band reads. */
.lattice[data-variant="S1"] .cell {
  animation: orb-wave 1.7s var(--orb-ease-in-out) infinite both;
}
```
```css
/* Swells and subsides on the same symmetric curve, so there is no flash and
   no hard edge - the cell rises out of its resting ink and sinks back into
   it. The long tail after 56% is the gap between beats. */
@keyframes orb-wave {
  0% {
    opacity: var(--orb-rest);
    transform: scale(1);
    animation-timing-function: cubic-bezier(0.66, 0, 0.34, 1);
  }
  28% {
    opacity: 1;
    transform: scale(1.18);
    animation-timing-function: cubic-bezier(0.66, 0, 0.34, 1);
  }
  56% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
  100% {
    opacity: var(--orb-rest);
    transform: scale(1);
  }
}
```
`--orb-ease-in-out` is defined on `.root` as `cubic-bezier(0.66, 0, 0.34, 1)` (L49-58).

**C3 (ring, "comet") — duration/delay/position, verbatim** (`Orb.tsx` L193-244)
```tsx
const RING_N = 8;
const RING_R = 8;

interface RingDot {
  key: number;
  rx: number;
  ry: number;
  delay: number;
}

function ringDuration(v: RingVariant): number {
  switch (v) {
    case "C1": return 1600;
    case "C2": return 2000;
    case "C3": return 1800;
    case "C4": return 1600;
    case "C5": return 2200;
  }
}

function ringDelay(v: RingVariant, i: number): number {
  const dur = ringDuration(v);
  switch (v) {
    case "C1":
      return -((RING_N - 1 - i) / RING_N) * dur;
    case "C2":
    case "C3":
      return -((RING_N - 1 - i) / RING_N) * dur;
    case "C4":
      return i % 2 === 0 ? 0 : -(dur / 2);
    case "C5": {
      const scrambled = (i * 3) % RING_N;
      return -(scrambled / RING_N) * dur;
    }
    default:
      return -(i / RING_N) * dur;
  }
}

function ringDots(v: RingVariant): RingDot[] {
  const dots: RingDot[] = [];
  for (let i = 0; i < RING_N; i++) {
    const angle = (i / RING_N) * Math.PI * 2 - Math.PI / 2;
    dots.push({
      key: i,
      rx: Math.cos(angle) * RING_R,
      ry: Math.sin(angle) * RING_R,
      delay: ringDelay(v, i),
    });
  }
  return dots;
}
```
The computed C3 delays (i = 0…7, starting at 12 o'clock and running clockwise) are `-1575, -1350, -1125, -900, -675, -450, -225, 0` ms. — [src: RUN node]

**C3 CSS, verbatim** (`Orb.module.css` L565-584, L615-637)
```css
/* --- Ring: eight circles on a fixed ring ----------------------------- */

.ring {
  position: absolute;
  inset: 0;
  transform: scale(var(--orb-k, 1));
  --orb-ring-rest: var(--orb-ring-rest-ink, 0.22);
}

.ringDot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 3px;
  margin: -1.5px 0 0 -1.5px;
  border-radius: 50%;
  background: currentColor;
  transform: translate(var(--orb-rx), var(--orb-ry));
}
```
```css
.ring[data-variant="C3"] .ringDot {
  animation: orb-ring-comet 1.8s ease-in-out infinite both;
}

@keyframes orb-ring-comet {
  0%, 100% {
    opacity: 0.08;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
  12% {
    opacity: 1;
    transform: translate(var(--orb-rx), var(--orb-ry));
    animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
  }
  35% {
    opacity: 0.5;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
  60% {
    opacity: 0.12;
    transform: translate(var(--orb-rx), var(--orb-ry));
  }
}
```

**Shared root/glyph CSS, verbatim** (`Orb.module.css` L49-58, L82-90)
```css
.root {
  --orb-ease-smooth: cubic-bezier(0.22, 1, 0.36, 1);
  --orb-ease-out: cubic-bezier(0.17, 1, 0.32, 1);
  --orb-ease-in-out: cubic-bezier(0.66, 0, 0.34, 1);

  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  color: var(--orb-fg, #1a1a1a);
}
```
```css
.glyph {
  position: relative;
  display: block;
  flex: none;
  width: 20px;
  height: 20px;
  overflow: hidden;
  contain: strict;
}
```

**Render structure for the S1/C3 branches, verbatim** (`Orb.tsx` L563-626, excerpt)
```tsx
export function Orb({
  variant = "S1",
  size = SIZE,
  label,
  pill,
  className,
  style,
}: OrbProps) {
  const text = label ?? ORB_TASKS[variant] + "…";
  return (
    <span
      className={styles.root + (className ? " " + className : "")}
      data-pill={pill ? "" : undefined}
      style={style}
    >
      <span
        className={styles.glyph}
        // In pill form the visible label already carries the meaning, so
        // the glyph steps out of the accessibility tree.
        role={pill ? undefined : "img"}
        aria-label={pill ? undefined : text}
        aria-hidden={pill ? true : undefined}
        style={
          { width: size, height: size, "--orb-k": size / STAGE } as CSSProperties
        }
      >
        {isLattice(variant) ? (
          <span className={styles.lattice} data-variant={variant}>
            {latticeCells(variant).map((c) => (
              <span
                key={c.key}
                className={styles.cell}
                data-still={c.still ? "" : undefined}
                data-mid={c.mid ? "" : undefined}
                style={
                  {
                    left: c.left,
                    top: c.top,
                    animationDelay: c.delay + "ms",
                    "--orb-ax": c.ax + "px",
                    "--orb-ay": c.ay + "px",
                    "--orb-bx": c.bx + "px",
                    "--orb-by": c.by + "px",
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : isRing(variant) ? (
          <span className={styles.ring} data-variant={variant}>
            {ringDots(variant).map((d) => (
              <span
                key={d.key}
                className={styles.ringDot}
                style={
                  {
                    "--orb-rx": d.rx + "px",
                    "--orb-ry": d.ry + "px",
                    animationDelay: d.delay + "ms",
                  } as CSSProperties
                }
              />
            ))}
          </span>
```

**MIT notice — keep it next to the vendored files (verbatim `LICENSE`)**
```text
MIT License

Copyright (c) 2026 AICSS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 11. Vitest 5 with Next 16 and TS paths (`@/*`)

```ts
// vitest.config.mts  (.mts avoids Vite 8's "ESM syntax in a file loaded as CommonJS" configLoader warning)
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    tsconfigPaths: true, // Vite 8 native; resolves "@/*" → "./src/*" from tsconfig.json
    alias: {
      // `server-only` throws outside the react-server condition; make it a no-op in tests
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    environment: "node", // use "jsdom" (+ jsdom, @testing-library/react) only for DOM tests
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
```
**Facts**
- Vitest 5.0.3 has `vite` `^6.4.0 || ^7.0.0 || ^8.0.0` as a **peer** dependency; pnpm resolved `vite@8.3.3` here. It requires Node `^22.12 || ^24 || >=26`. — [src: VT vitest@5.0.3 package.json; repo pnpm-lock.yaml]
- Vite 8 has `resolve.tsconfigPaths?: boolean` (default `false`): "`paths` option in `tsconfig.json` will be used to resolve imports". It only applies to files matched by the tsconfig's `include`/`files`, and this repo's `**/*.ts(x)` covers them. — [src: VT vite@8.3.3 dist/node/index.d.ts L2720-2727; vitejs/vite docs/config/shared-options.md "resolve.tsconfigPaths"]
- The Next 16.4 Vitest guide still uses the `vite-tsconfig-paths` plugin plus `@vitejs/plugin-react` and `environment: 'jsdom'`. Vitest cannot test `async` Server Components; use E2E for those. — [src: NEXT 02-guides/testing/vitest.md L9, L63-76]
- Verified in the scratch copy with vitest 5.0.3 and vite 8.3.3:
  - `resolve.tsconfigPaths: true` resolves `@/lib/utils`.
  - `import "server-only"` throws "This module cannot be imported from a Client Component module…" without the alias and passes with it.
  - A `.tsx` test using `renderToStaticMarkup` works **without** `@vitejs/plugin-react`.
  - A `.ts` config printed the configLoader warning; `.mts` did not.

  — [src: RUN vitest]
- A `resolve.alias` approach (`"@": fileURLToPath(new URL("./src", import.meta.url))`) also works. Avoid relative alias targets, which "Vite treats … as relative to the file where the import is". — [src: vitest-dev/vitest docs/guide/common-errors.md]

---

## Appendix A — discrepancies found between sources
1. **shadcn `--defaults`.** The docs on main say `--preset=nova`; the 4.21.3 CLI says `--preset=base-nova`. Use the CLI's behaviour. — [src: SH (root)/cli.mdx vs SH-CLI `init --help`]
2. **Next Turbopack docs vs `@tailwindcss/turbopack`.** The Next docs say CSS-transforming loaders are unsupported; Tailwind ships one for Next and it produced CSS in this repo's build. — [src: NEXT turbopack.md; TWT README; repo .next]
3. **Next forms guide uses zod v3 APIs.** With zod 4, use `{ error }` and `z.flattenError`. — [src: NEXT forms.md; ZOD changelog]
4. **Next `route.md` segment-config example (`dynamic`, `revalidate`).** These configs are removed under Cache Components. — [src: NEXT route-segment-config/index.md]
5. **`catchError` docs table types `error` as `Error`.** The 16.4.0 `.d.ts` types it `unknown`. — [src: NEXT catchError.md L125 vs NEXT-SRC error-boundary.d.ts]
6. **sonner default desktop offset.** The site says 32px; the 2.0.8 code uses 24px. — [src: sonner.emilkowal.ski/toaster vs SON dist]
7. **context7's sonner promise example used `{ title, description }` objects.** The 2.0.8 types and source use `{ message, …}`; I used the source. — [src: SON dist/index.d.ts PromiseIExtendedResult]
8. **cn README "CLI needs Node 20+".** The npm 0.4.0 README says 20+, while GitHub main says 22+. Only relevant if you use `cn build`. — [src: CN README (npm) vs shadcn-ui/cn README (main)]

## Appendix B — scratch evidence (this session only)
- shadcn init/add output: `…/scratchpad/w1/docs-packet/initproj/{components.json,src/lib/utils.ts,src/app/globals.css,src/components/ui/*}`
- Type-checked snippets (`next typegen && tsc --noEmit`, 0 errors): `…/initproj/src/proxy.ts`, `…/initproj/src/lib/session-token.ts`, `…/initproj/src/app/layout.tsx`, `…/initproj/src/app/fonts.ts`, `…/initproj/src/app/{global-error,not-found}.tsx`, `…/initproj/src/app/(auth)/{layout.tsx,login/*}`, `…/initproj/src/app/(app)/{layout.tsx,error.tsx,plans-demo/*,subscriptions/*}`, `…/initproj/src/app/auth/sign-out/route.ts`, `…/initproj/src/components/{demo,nav,patterns}/*`, `…/initproj/src/lib/{zod-demo.ts,cnalt/utils.ts}`
- Vitest config and tests: `…/initproj/vitest.scratch.config.mts`, `…/initproj/src/lib/__t/*`
- Tailwind compile tests: `…/initproj/twtest/*`
- aicss sources: `…/scratchpad/w1/docs-packet/gh/aicss/*`
