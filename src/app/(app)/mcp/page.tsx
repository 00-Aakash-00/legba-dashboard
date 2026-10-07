import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/patterns/page-header";
import { SectionCard } from "@/components/patterns/section-card";
import { buttonVariants } from "@/components/ui/button";
import { workspace } from "@/content/copy";
import { WithPlaceholders } from "@/features/developers/code-lines";
import { CodeTabs } from "@/features/developers/code-tabs";
import {
  CardPreviewChip,
  PreviewNote,
} from "@/features/developers/preview-chip";
import { mcpConfigs } from "@/features/developers/samples";
import { SideCard } from "@/features/developers/side-card";
import { Step, StepList } from "@/features/developers/step-list";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: workspace.mcp.title,
  description: workspace.mcp.description,
};

/**
 * MCP (Preview). Legba does not publish a public MCP server, so the client
 * config is the illustrative one the user approved, labelled as such. Static:
 * the page prerenders into the shell; the config tabs are the client island.
 */
export default function McpPage() {
  const copy = workspace.mcp;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <PreviewNote>{copy.preview}</PreviewNote>
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:grid-cols-[minmax(0,925fr)_minmax(0,473fr)]">
        <SectionCard headingId="mcp-connect-heading" title={copy.section}>
          <CardPreviewChip />
          <StepList className="px-5 pt-6 pb-6">
            <Step
              number={1}
              title={workspace.keyStep}
              body={copy.keyBody}
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
            <Step number={2} title={copy.add.title} body={copy.add.body}>
              <CodeTabs
                label={copy.config.label}
                tabsLabel={copy.config.tabs}
                tabs={mcpConfigs.map(({ id, code }) => ({
                  id,
                  code,
                  label: copy.config.clients[id],
                  name: copy.config.name(copy.config.clients[id]),
                }))}
              />
              <p className="mt-3 font-medium text-[13.5px] text-ink-subtle leading-5 tracking-[-0.01em]">
                <WithPlaceholders text={copy.add.placeholders} />
              </p>
            </Step>
            <Step number={3} title={copy.ask.title} body={copy.ask.body} />
          </StepList>
        </SectionCard>
        <SideCard
          headingId="mcp-skill-heading"
          title={copy.skill.title}
          body={copy.skill.body}
          action={
            <Link
              href="/agent-skill"
              className={cn(
                buttonVariants({ variant: "pill-red", size: "pill-lg" }),
                "px-6 pointer-coarse:h-12",
              )}
            >
              {copy.skill.action}
            </Link>
          }
        />
      </div>
    </PageLayout>
  );
}
