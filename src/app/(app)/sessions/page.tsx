import type { Metadata } from "next";
import { PageLayout } from "@/components/patterns/page-header";
import { SectionCard } from "@/components/patterns/section-card";
import { workspace } from "@/content/copy";
import { CodeTabs } from "@/features/developers/code-tabs";
import {
  CardPreviewChip,
  PreviewNote,
} from "@/features/developers/preview-chip";
import { createSessionSamples } from "@/features/developers/samples";
import { SessionsSection } from "@/features/developers/sessions-section";

export const metadata: Metadata = {
  title: workspace.sessions.title,
  description: workspace.sessions.description,
};

/**
 * Sessions started through the browser API (a public preview). The list
 * streams in behind its own Suspense and error boundary; the create-session
 * sample beside it is static and prerenders into the shell.
 */
export default function SessionsPage() {
  const copy = workspace.sessions;
  const start = copy.start;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <PreviewNote>{copy.preview}</PreviewNote>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SessionsSection />
        <SectionCard headingId="session-start-heading" title={start.title}>
          <CardPreviewChip />
          <p className="px-5 pt-3 text-pretty font-medium text-[15px] text-ink-2 leading-[21.5px] tracking-[-0.025em]">
            {start.body}
          </p>
          <div className="px-5 pt-5 pb-5">
            <CodeTabs
              label={start.code}
              tabsLabel={start.tabs}
              tabs={createSessionSamples.map(({ id, code }) => ({
                id,
                code,
                label: start.languages[id],
                name: start.sample(start.languages[id]),
              }))}
            />
            <p className="mt-3.5 font-medium text-[13.5px] text-ink-subtle leading-5 tracking-[-0.01em]">
              {start.response.lead}{" "}
              <code className="rounded-[6px] border border-line-chip bg-field px-1.5 py-px text-[12.5px] text-ink-2">
                {start.response.field}
              </code>{" "}
              {start.response.tail}
            </p>
          </div>
        </SectionCard>
      </div>
    </PageLayout>
  );
}
