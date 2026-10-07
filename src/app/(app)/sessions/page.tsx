import { AppWindowIcon, ArrowUpRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { PageLayout } from "@/components/patterns/page-header";
import { StubSection } from "@/components/patterns/stub-section";
import { buttonVariants } from "@/components/ui/button";
import { links, overview, workspace } from "@/content/copy";
import { cn } from "@/lib/utils";
import { listSessions } from "@/server/services/sessions";

export const metadata: Metadata = { title: workspace.sessions.title };

export default function SessionsPage() {
  const copy = workspace.sessions;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <StubSection
        id="sessions"
        copy={copy}
        icon={AppWindowIcon}
        load={listSessions}
        action={
          <a
            href={links.apiDocs}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "pill-red", size: "pill-lg" }),
              "pointer-coarse:h-12",
            )}
          >
            {copy.empty.action}
            <ArrowUpRightIcon aria-hidden className="size-[18px]" />
            <span className="sr-only">{overview.docs.opensInNewTab}</span>
          </a>
        }
      />
    </PageLayout>
  );
}
