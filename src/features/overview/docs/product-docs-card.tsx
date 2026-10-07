import DocumentStack from "@/components/hairline/document-stack/DocumentStack";
import { overview } from "@/content/copy";
import { CopyCommand } from "./copy-command";
import { DocsCardIntro, docsCardClass, ExploreLink } from "./docs-card";

const titleId = "skill-docs-title";

/**
 * Install-skill card, in the mockup's Product Documentation slot (spec
 * overview.json docs.product.*): the agent skill's install command (a
 * placeholder, marked Preview) and the way into the Agent Skill page.
 * Static apart from two client islands: the copy button, and DocumentStack,
 * which mounts its interactive figure near the viewport (its static fallback
 * shows until then, or for good if the figure fails to load).
 */
export function InstallSkillCard() {
  const copy = overview.docs.skill;
  return (
    <section aria-labelledby={titleId} className={docsCardClass("skill")}>
      <DocsCardIntro
        tone="skill"
        titleId={titleId}
        title={copy.title}
        body={copy.body}
        bodyClassName="@min-[375px]/docs:max-w-[236px]"
      />
      {/* Narrow: 70% wide under the text (the figure sits low in its 5:4
          box, so the top margin is the smaller one). Wide: the mockup's art
          region, scaled down (around its plate's centre) when the card is
          narrower than at 1440, so the plate's left edge (an eighth of the
          art's width in) stays 247px into the content box, where the 1440
          card has it. */}
      <div className="mx-auto mt-4 mb-7 w-[70%] @min-[375px]/docs:absolute @min-[375px]/docs:top-[calc(152.75px-var(--art-w)*0.48375)] @min-[375px]/docs:right-[2px] @min-[375px]/docs:m-0 @min-[375px]/docs:w-(--art-w) @min-[375px]/docs:[--art-w:min(232px,calc((100cqw-230px)/0.875))]">
        <DocumentStack loading="lazy" label={copy.art} />
      </div>
      {/* Wide: under the text, 224px, which leaves at least the 1440
          mockup's 23px between it and the art's plate; narrow: the card's
          full width. */}
      <CopyCommand className="relative z-10 mb-5 [--cmd-w:100cqw] @min-[375px]/docs:mt-[12.4px] @min-[375px]/docs:mb-0 @min-[375px]/docs:[--cmd-w:224px] @min-[375px]/docs:supports-[text-box:trim-both_cap_text]:mt-3.5" />
      <ExploreLink
        tone="skill"
        route="/agent-skill"
        label={copy.cta}
        context={copy.ctaContext}
        className="mt-auto"
      />
    </section>
  );
}

/** The overview page's name for this slot (the mockup's Product Documentation card). */
export const ProductDocsCard = InstallSkillCard;
