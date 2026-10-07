import { ArrowRightIcon, MonitorUpIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/patterns/page-header";
import { StubSection } from "@/components/patterns/stub-section";
import { buttonVariants } from "@/components/ui/button";
import { workspace } from "@/content/copy";
import { cn } from "@/lib/utils";
import { listDeployments } from "@/server/services/workspace";

export const metadata: Metadata = { title: workspace.deployments.title };

export default function DeploymentsPage() {
  const copy = workspace.deployments;
  return (
    <PageLayout title={copy.title} description={copy.description}>
      <StubSection
        id="deployments"
        copy={copy}
        icon={MonitorUpIcon}
        load={listDeployments}
        action={
          <Link
            href="/models"
            className={cn(
              buttonVariants({ variant: "pill-red", size: "pill-lg" }),
              "pointer-coarse:h-12",
            )}
          >
            {copy.empty.action}
            <ArrowRightIcon aria-hidden className="size-[18px]" />
          </Link>
        }
      />
    </PageLayout>
  );
}
