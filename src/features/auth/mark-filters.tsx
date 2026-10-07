/**
 * Display filters for the locked doll mark (public/brand/mark.png is never
 * edited). docs/design/spec/login.json measures the mockup's two treatments:
 *
 * - `legba-mark-cut` (showcase): the black face drops out so the panel's
 *   glow shows through, and the strokes read #f02b4e. Alpha comes from the
 *   red channel (black → 0), then is masked by the source alpha so the
 *   anti-aliased outer edge stays soft.
 * - `legba-mark-face` (auth lockup): the black face becomes #4a2e2d while
 *   the red keeps the asset colour (#d13950): a per-channel map with
 *   black → #4a2e2d and #d13950 → #d13950.
 *
 * Rendered once per auth layout; referenced as `filter: url(#…)`. The SVG
 * is 0×0 rather than display:none, which would disable the filters.
 */
export function MarkFilters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="0"
      height="0"
      className="pointer-events-none absolute size-0 overflow-hidden"
    >
      <defs>
        <filter id="legba-mark-cut" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.941  0 0 0 0 0.169  0 0 0 0 0.306  1.25 0 0 0 0"
          />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
        <filter id="legba-mark-face" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.6459 0 0 0 0.2902  0 0.193 0 0 0.1804  0 0 0.4375 0 0.1765  0 0 0 1 0"
          />
        </filter>
      </defs>
    </svg>
  );
}
