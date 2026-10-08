import { links, overview } from "@/content/copy";
import { cn } from "@/lib/utils";
import { CodeSample } from "./code-sample";
import { DocsCardIntro, docsCardClass, ExploreLink } from "./docs-card";

const titleId = "api-docs-title";

/**
 * API Documentation card. Static (no data), so it prerenders into the shell;
 * the language tabs are the only client island. Wide cards put the code panel
 * on the right: the mockup's 218px at 1440, narrowing to 190px (the tab bar's
 * width) on smaller cards, and growing on wider ones (225px left for the
 * text) until every curl line fits. The body keeps at least 12px clear of
 * the panel. A card stretched taller than the mockup's 260px (the page row on
 * desktop) grows the panel with it: the panel ends the mockup's 47.05px
 * inside the card's bottom border and spreads its lines over the extra
 * height (code-sample.tsx); it is never shorter than its lines. Narrow
 * cards stack the panel under the text. The samples call the preview API's
 * placeholder host.
 */
export function ApiDocsCard() {
  const copy = overview.docs.api;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        docsCardClass("api"),
        "[--panel-w:min(400px,max(190px,min(218px,calc(100cqw-204.5px)),calc(100cqw-225px)))]",
      )}
    >
      <DocsCardIntro
        tone="api"
        titleId={titleId}
        title={copy.title}
        body={copy.body}
        bodyClassName="@min-[375px]/docs:max-w-[min(236px,calc(100cqw-var(--panel-w)-11.5px))]"
      />
      <div className="relative my-7 @min-[375px]/docs:absolute @min-[375px]/docs:top-[49.5px] @min-[375px]/docs:right-[15.5px] @min-[375px]/docs:m-0 @min-[375px]/docs:grid @min-[375px]/docs:min-h-[calc(100%-96.55px)] @min-[375px]/docs:w-(--panel-w) @min-[375px]/docs:grid-cols-1">
        {/* Blueprint grid behind the panel (docs.api.illustration.grid), the
            same motif as the skill card's art: two hairlines just outside
            the panel and a 26px column grid that fades away from it. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[22.9px] right-[6.5px] -bottom-[23.3px] left-[1.5px] bg-[linear-gradient(90deg,transparent,rgb(245_243_236/0.008)_40%,rgb(245_243_236/0.008)_55%,transparent_82%),linear-gradient(90deg,transparent,rgb(245_243_236/0.022)_40%,rgb(245_243_236/0.022)_55%,transparent_82%)] bg-[position:0_0,0_100%] bg-[size:100%_1px] bg-no-repeat"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[49px] -bottom-[46.5px] left-[calc(50%-64.9px)] w-[157.2px] bg-[repeating-linear-gradient(90deg,rgb(245_243_236/0.042)_0_1px,transparent_1px_26.25px)] [mask-composite:intersect] [mask-image:linear-gradient(90deg,transparent_8%,#000_50%,transparent_92%),linear-gradient(transparent_2%,#000_20%,#000_80%,transparent_105%)]"
        />
        <CodeSample />
      </div>
      <ExploreLink
        tone="api"
        href={links.apiDocs}
        label={copy.cta}
        context={copy.title}
        className="mt-auto"
      />
    </section>
  );
}
