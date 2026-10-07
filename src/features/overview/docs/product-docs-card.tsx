import DocumentStack from "@/components/hairline/document-stack/DocumentStack";
import { links, overview } from "@/content/copy";
import { DocsCardIntro, docsCardClass, ExploreLink } from "./docs-card";

const titleId = "product-docs-title";

/**
 * Product Documentation card. Static (no data), so it prerenders into the
 * shell; DocumentStack is its own client island and mounts its interactive
 * figure near the viewport (its static fallback shows until then, or for good
 * if the figure fails to load).
 */
export function ProductDocsCard() {
  const copy = overview.docs.product;
  return (
    <section aria-labelledby={titleId} className={docsCardClass("product")}>
      <DocsCardIntro
        tone="product"
        titleId={titleId}
        title={copy.title}
        body={copy.body}
        className="@min-[375px]/docs:max-w-[236px]"
      />
      {/* Narrow: 70% wide under the text (the figure sits low in its 5:4
          box, so the top margin is the smaller one). Wide: the mockup's art
          region, scaled down (around its plate's centre) only when the card is
          too narrow to keep the plate clear of the title. */}
      <div className="mx-auto mt-4 mb-9 w-[70%] @min-[375px]/docs:absolute @min-[375px]/docs:top-[calc(152.75px-var(--art-w)*0.48375)] @min-[375px]/docs:right-[2px] @min-[375px]/docs:m-0 @min-[375px]/docs:w-(--art-w) @min-[375px]/docs:[--art-w:min(232px,calc((100cqw-218px)/0.875))]">
        <DocumentStack loading="lazy" label={copy.art} />
      </div>
      <ExploreLink
        tone="product"
        href={links.docs}
        label={copy.cta}
        context={copy.title}
        className="mt-auto"
      />
    </section>
  );
}
