import { links, overview } from "@/content/copy";
import { cn } from "@/lib/utils";
import { CodeSample } from "./code-sample";
import { DocsCardIntro, docsCardClass, ExploreLink } from "./docs-card";

const titleId = "api-docs-title";

/**
 * API Documentation card. Static (no data), so it prerenders into the shell;
 * the language tabs are the only client island. Wide cards keep the mockup's
 * 218px code panel on the right and give way to 190px (the tab bar's width)
 * before the title would wrap; narrow cards stack the panel under the text.
 */
export function ApiDocsCard() {
  const copy = overview.docs.api;
  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        docsCardClass("api"),
        "[--panel-w:min(218px,max(190px,calc(100cqw-204.5px)))]",
      )}
    >
      <DocsCardIntro
        tone="api"
        titleId={titleId}
        title={copy.title}
        body={copy.body}
        className="@min-[375px]/docs:pr-[calc(var(--panel-w)-0.5px)]"
      />
      <div className="relative my-7 @min-[375px]/docs:absolute @min-[375px]/docs:top-[49.5px] @min-[375px]/docs:right-[15.5px] @min-[375px]/docs:m-0 @min-[375px]/docs:w-(--panel-w)">
        {/* Blueprint grid behind the panel (docs.api.illustration.grid), the
            same motif as the product card's art: two hairlines just outside
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
