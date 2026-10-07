import type { Metadata } from "next";
import { Suspense } from "react";
import { PageLayout } from "@/components/patterns/page-header";
import { plansPage } from "@/content/copy";
import { AgentPlans } from "@/features/plans/agent-plans";
import { ExtensionPlan } from "@/features/plans/extension-plan";
import { PreviewNote } from "@/features/plans/parts";
import { PlanStateNotice } from "@/features/plans/slots";

export const metadata: Metadata = { title: plansPage.pageTitle };

/**
 * Plans: where the account subscribes. The catalog (agent plans, Enterprise,
 * the Chrome extension) is static and prerenders into the shell. Only the
 * per-user parts stream: the current-plan chips, the buttons and the
 * extension's status, all from one plan read. If that read fails, the
 * catalog stays and the notice here says so once, with the retry.
 */
export default function PlansPage() {
  return (
    <PageLayout
      title={plansPage.pageTitle}
      description={plansPage.pageDescription}
    >
      <PreviewNote>{plansPage.previewNote}</PreviewNote>
      <Suspense
        fallback={
          <p role="status" className="sr-only">
            {plansPage.loading}
          </p>
        }
      >
        <PlanStateNotice />
      </Suspense>
      <div className="flex flex-col gap-12 lg:gap-14">
        <AgentPlans />
        <ExtensionPlan />
      </div>
    </PageLayout>
  );
}
