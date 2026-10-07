import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/patterns/page-header";
import { SectionCard } from "@/components/patterns/section-card";
import { buttonVariants } from "@/components/ui/button";
import { workspace } from "@/content/copy";
import { CopyField } from "@/features/developers/copy-field";
import { CardPreviewChip } from "@/features/developers/preview-chip";
import { INSTALL_COMMAND } from "@/features/developers/samples";
import { SideCard } from "@/features/developers/side-card";
import { Step, StepList } from "@/features/developers/step-list";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: workspace.agentSkill.title,
  description: workspace.agentSkill.description,
};

/**
 * Agent Skill. The skill is Legba's agent path; its install command is a
 * placeholder until the package is published, so it carries the Preview chip.
 * Static: prerenders into the shell; the copy field is the client island.
 */
export default function AgentSkillPage() {
  const copy = workspace.agentSkill;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:grid-cols-[minmax(0,925fr)_minmax(0,473fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            headingId="skill-install-heading"
            title={copy.install.section}
          >
            <CardPreviewChip />
            <div className="px-5 pt-5 pb-5">
              <CopyField value={INSTALL_COMMAND} name={copy.install.name} />
              <p className="mt-3 font-medium text-[13.5px] text-ink-subtle leading-5 tracking-[-0.01em]">
                {copy.install.note}
              </p>
            </div>
          </SectionCard>
          <SectionCard
            headingId="skill-setup-heading"
            title={copy.setup.section}
            className="flex-1"
          >
            <StepList className="px-5 pt-6 pb-6">
              <Step
                number={1}
                title={workspace.keyStep}
                body={copy.setup.keyBody}
                action={
                  <Link
                    href="/api-keys"
                    className={cn(
                      buttonVariants({
                        variant: "outline-pill",
                        size: "pill-md",
                      }),
                      "pointer-coarse:h-11",
                    )}
                  >
                    {workspace.createKey}
                  </Link>
                }
              />
              <Step
                number={2}
                title={copy.setup.install.title}
                body={copy.setup.install.body}
              />
              <Step
                number={3}
                title={copy.setup.ask.title}
                body={copy.setup.ask.body}
              />
            </StepList>
          </SectionCard>
        </div>
        <div className="flex min-w-0 flex-col gap-4">
          <SectionCard
            headingId="skill-features-heading"
            title={copy.features.section}
          >
            {/* biome-ignore lint/a11y/noRedundantRoles: list-style: none drops list semantics in Safari/VoiceOver. */}
            <ul role="list" className="flex flex-col gap-3.5 px-5 pt-5 pb-6">
              {copy.features.items.map((item) => (
                <li
                  key={item}
                  className="flex gap-3.5 text-pretty font-semibold text-[#c9ccd0] text-[14.5px] leading-[21px] tracking-[-0.02em] before:mt-[8.5px] before:size-1 before:shrink-0 before:rounded-full before:bg-ink-subtle before:content-['']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </SectionCard>
          <SideCard
            headingId="skill-contact-heading"
            className="flex-1"
            title={copy.contact.title}
            body={copy.contact.body}
            action={
              <a
                href={copy.contact.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "pill-red", size: "pill-lg" }),
                  "px-6 pointer-coarse:h-12",
                )}
              >
                {copy.contact.action}
                <span className="sr-only"> {workspace.newTab}</span>
              </a>
            }
          />
        </div>
      </div>
    </PageLayout>
  );
}
