# Document stack

A portable document illustration with three interactive panels, a background grid, and a soft glow. The DOC lettering uses SVG outlines, so it needs no font download.

## Copy into your project

Copy this **entire folder** into your application's source tree. Keep these files together:

```text
document-stack/
  DocumentStack.tsx
  DocumentStack.module.css
  documents.js
  documents.d.ts
  kernel.js
  assets.ts
  LICENSE
  README.md
```

The host application needs React 18 or newer, React DOM, and a frontend bundler with TypeScript/TSX and CSS Modules support. React and React DOM are the only runtime peers. An existing React TypeScript application needs no additional dependency installation.

The component has no Next.js, Tailwind, path-alias, or public-directory dependency. Its SVG fallback and PNG texture are embedded in `assets.ts`. It makes no external image, font, or service requests; your bundler serves the application code and any generated local chunks normally. CSS stays scoped to the component, without calling the kernel's global `HL.inject` helper.

Interaction uses modern browser APIs: `IntersectionObserver`, `matchMedia`, `requestAnimationFrame`, and `crypto.randomUUID`. Serve it over HTTPS or localhost for `randomUUID`'s secure-context requirement. If your host sets a Content Security Policy, allow `data:` images through `img-src` and the component's inline style attributes through `style-src-attr` or its fallback `style-src` policy. These styles supply the dither CSS variable and SVG gradient fills; server-rendered React `style` props also become ordinary style attributes. See [browser support for `randomUUID`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID) and [inline style policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr).

## Basic usage

With `document-stack` beside your consuming component:

```tsx
import DocumentStack from './document-stack/DocumentStack'

export default function Example() {
  return (
    <div style={{ background: '#0A0A0B', padding: 64 }}>
      <DocumentStack style={{ maxWidth: 440, margin: '0 auto' }} />
    </div>
  )
}
```

The canvas is transparent and designed for a `#0A0A0B` background. It fills its container's width and reserves a 5:4 aspect ratio. The grid and glow extend around 48px beyond the figure. Allow visible overflow and surrounding space; a tightly clipped ancestor will cut them off.

## Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `className` | `string` | None | Add a class to the outer wrapper. |
| `style` | `React.CSSProperties` | None | Set wrapper sizing, margins, or other inline styles. |
| `label` | `string` | Built-in description | Override the illustration's accessible description. |
| `interactive` | `boolean` | `true` | Set `false` to retain the static fallback. |
| `loading` | `'eager' \| 'lazy'` | `'eager'` | Mount interaction immediately or near the viewport. |

Use the default eager behavior in a hero. For lower-page artwork:

```tsx
<DocumentStack loading="lazy" />
```

For a static illustration, including server-rendered output:

```tsx
<DocumentStack interactive={false} label="A stack of document panels." />
```

## Vite

In an existing React TypeScript Vite app, copy the folder to `src/document-stack` and use the basic example in `src/App.tsx`. Vite handles the CSS Module import automatically.

Keep Vite's client type declarations, normally supplied by the starter. If they are missing, add this to `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Alternatively, retain `"vite/client"` in the existing TypeScript `compilerOptions.types` array. See the [Vite client types documentation](https://vite.dev/guide/features.html#client-types).

## Next.js

Copy the folder to `components/document-stack`. Import it into an App Router page:

```tsx
import DocumentStack from '../components/document-stack/DocumentStack'

export default function Page() {
  return (
    <main style={{ background: '#0A0A0B', padding: 64 }}>
      <DocumentStack style={{ maxWidth: 440, margin: '0 auto' }} />
    </main>
  )
}
```

This example assumes the page is `app/page.tsx`; adjust the relative import for nested routes or a `src` layout. The component supplies its own client boundary, so the page can remain a Server Component. No dynamic wrapper or global stylesheet import is required. Next.js provides [CSS Modules support](https://nextjs.org/docs/app/getting-started/css#css-modules) and its associated TypeScript declarations.

For another bundler, ensure it supports `.module.css` imports and provides their TypeScript declaration. A declaration alone does not add CSS Modules support to a bundler.

## Interaction and accessibility

Move or press the pointer over the stack to separate the panels. Keyboard users can focus the interactive figure and use the arrow keys, Home, and End. Escape restores the resting view. Focus leaving the figure also resets it.

The component respects `prefers-reduced-motion`. Its accessible label describes the artwork; hidden instructions explain the keys, and a polite live region announces selection changes. The background grid and glow are decorative.

The static fallback renders before interaction loads, including during server rendering. It remains visible if JavaScript is unavailable or the interactive module fails to load. With `interactive={false}`, the component stays static and does not expose interactive controls.

## License

Keep `LICENSE` with the folder when copying or redistributing it. The bundled Hairline kernel is supplied unchanged under MIT; preserve its copyright and permission notice.
