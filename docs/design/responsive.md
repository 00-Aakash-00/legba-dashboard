# Responsive and mobile design

The mockups define 1440px desktop. This document defines every other width, in the same visual language
(frontend-design + mobile-native + emil-design-eng). The mobile version is not a squeezed desktop: it
has its own shell, thumb-reach navigation, and gesture surfaces, on the same routes.

## Breakpoints

| Range | Name | Shell | Notes |
|---|---|---|---|
| < 640 | phone | mobile shell | one column, 16px gutters, bottom tab bar |
| 640–1023 | large phone / tablet portrait | mobile shell | one column, wider cards; docs cards 2-up from 768 |
| 1024–1279 | compact desktop | desktop header | search collapses to an icon button (⌘K); 2-column grid (60/40) |
| ≥ 1280 | desktop | desktop header | the mockup, measured at 1440 (`docs/design/spec/*.json`) |

Cards switch their internal layout with container queries (`@container`), not viewport width, so a card
looks right in any column it lands in.

## Mobile shell (< 1024)

```
┌──────────────────────────────────────┐ ← env(safe-area-inset-top)
│ [mark] LEGBA                 (⌕) (◯) │  56px top bar · bg shell · 1px bottom line · sticky
├──────────────────────────────────────┤
│                                      │
│   page content · px-4 · gap-4        │
│                                      │
├──────────────────────────────────────┤
│ ▔▔▔▔                                 │  2px red bar with glow on top of the active tab
│  ▦      ▭      ⬡      ✎      ⚿       │  64px tab bar · icon 20px · label 11px semibold
│ Overview Deploy Models Registries Keys│
└──────────────────────────────────────┘ ← env(safe-area-inset-bottom)
```

- Primary navigation sits in thumb reach (ux-guidelines CHOICES, mobile row). Labels always visible.
- Active tab: bone label + red 2px bar with the same glow as the desktop underline. Inactive: muted.
- Search (⌕) opens the command palette full-screen (no open animation: emil, ⌘K rule).
- Avatar (◯) opens the account menu: identity, **Top up credits**, Contact support, Documentation,
  Sign out. (Top-Up and the header icons live here on mobile.)
- Page content gets `padding-bottom: calc(64px + env(safe-area-inset-bottom))` so nothing hides under
  the tab bar; toasts sit above it (`--tabbar-h`), and `scroll-padding` keeps focused controls visible.
- Landscape: fixed edges also pad `env(safe-area-inset-left/right)`.
- `:active` press feedback on every tab (scale .97, 120ms ease-out); no hover styles on touch.

## Login and auth pages

Desktop (≥ 1024): the mockup — showcase panel 44% / form panel 56%, both full height, 12px margin, 16px gap.

Below 1024 the showcase becomes a compact banner and the form takes the page:

```
┌──────────────────────────────────┐
│ ╭──────────────────────────────╮ │  showcase banner · h-40 (160px) · radius 24 · 2px red border + glow
│ │ [mark 44]          ▪▪ ▪       │ │  pixel clusters top-right · gradient + blurred glow as desktop
│ │ Cloud, Edge, and             │ │  slide title 20/24 semibold (accent words red)
│ │ AI Solutions          • ○ ○  │ │  dots bottom-right · swipe = native scroll-snap (x mandatory, overscroll-x contain)
│ ╰──────────────────────────────╯ │  slide body hidden < 640 (shown 640–1023, 2 lines)
│                                  │
│  Welcome back to                 │  heading 26/30 semibold, left-aligned on phone
│  Inference Box!                  │
│  Enter your username and …       │  14px muted
│                                  │
│  Email                           │  inputs 48px high, 16px text (no iOS zoom)
│  [____________________________]  │  type=email · autocomplete=email · autocapitalize=none · enterkeyhint=next
│  Password                        │
│  [________________________ 👁 ]  │  autocomplete=current-password · enterkeyhint=go · eye button 44×44 hit
│  ☑ Remember me   Forgot password?│
│  [           Log in           ]  │  48px pill
│  ───────── Or login with ─────── │
│  [ SSO ] [ Google ] [ GitHub ]   │  3 equal columns · 48px · icons 18px
│  Don't have an account? Register │
│                                  │
│  By logging in, you agree to …   │  12px · pinned to the bottom with safe-area padding
└──────────────────────────────────┘
```

- The lockup (mark + LEGBA) is hidden below 1024 because the banner already carries the mark.
- Register / forgot / SSO pages share the same shell and field styling.

## Overview

1024–1279: grid `minmax(0,3fr) minmax(0,2fr)`; hero | instances; subscriptions | docs stack. The
subscriptions carousel shows one card plus a peek, with the arrows.

Below 1024 (one column, order: hero, instances, subscriptions, docs):

```
╭ Your API Keys ───────────────╮  hero · min-h 300 · eyebrow 11px · title 30/34 · body 15px
│  SECURE • DEPLOY • SCALE     │  CTA full width 52px · caption 13px · hero art: object-position center
│  Your API Keys               │
│  [⚿ Create API Key        ›] │
╰──────────────────────────────╯
╭ View your instances ─────────╮  instances · title 24/28 · Launch pill · rack art scaled to 70%, bottom-right
╰──────────────────────────────╯
╭ ■ Your subscriptions [2] [All▾]╮ header wraps: title row, then filter + "View All ↗" on one row
│ ┌──────────────────────┐┌──  │  scroll-snap row · card width 86% (next card peeks) · gap 12
│ │ By: Legba   ● Active │└──  │  card (container query < 420px): figure on top (h-44, centred),
│ │   [hairline figure]  │     │  then title 22px, body, features (1 col), Manage bar 52px
│ │ Ghost Mode …         │     │  dots under the row; arrows hidden for coarse pointers
│ └──────────────────────┘     │
╰──────────────────────────────╯
╭ DOCS · Product Documentation ╮  text first, DocumentStack art below at 70% (no clipping of its glow)
╰──────────────────────────────╯
╭ DOCS · API Documentation ────╮  text first, code block full width below, horizontal scroll inside
╰──────────────────────────────╯
```

From 768 the two docs cards sit side by side.

## Stub pages (deployments, models, registries, api keys, subscriptions)

```
Page header: title (28/32 semibold) + one-line description (muted) + primary action (right on desktop,
full width below the description on phone).
Body: the section card (radius 20, panel bg, 1px line) holding the section's four states:
  loading → skeleton rows (delayed 300ms) · empty → shadcn Empty with the hairline-free icon tile,
  title, body, action · error → SectionError · success → list.
```

The empty-state card uses the mockup's red square bullet + small-caps eyebrow vocabulary so stub pages
read as part of the same product.

## Motion (emil-design-eng)

- Press: scale(0.97), 120–160ms, `--ease-out-strong`. Hover (fine pointers only): colour/border, 150ms.
- Dropdowns/menus: 150–200ms from `var(--transform-origin)`; dialogs 220ms centred; bottom sheets
  240ms `--ease-drawer`; tooltips 125ms, instant after the first.
- Carousels: native scroll-snap with `scroll-behavior: smooth` (instant under reduced motion).
- Login showcase autoplay: every 6s, crossfade 400ms; pauses on hover/focus/hidden tab; stops after the
  user picks a slide; off under `prefers-reduced-motion`.
- Never animate keyboard-triggered UI (⌘K palette opens instantly).
