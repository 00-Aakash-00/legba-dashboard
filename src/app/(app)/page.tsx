import type { Metadata } from "next";
import { overview } from "@/content/copy";
import { ApiDocsCard } from "@/features/overview/docs/api-docs-card";
import { ProductDocsCard } from "@/features/overview/docs/product-docs-card";
import { ApiKeysHero } from "@/features/overview/hero/api-keys-hero";
import { InstancesCard } from "@/features/overview/instances/instances-card";
import { SubscriptionsPanel } from "@/features/subscriptions/subscriptions-panel";

export const metadata: Metadata = { title: overview.title };

/**
 * Overview. Every card is static and prerenders into the shell except the
 * subscriptions section, which reads the session behind its own Suspense
 * and error boundary inside SubscriptionsPanel.
 */
export default function OverviewPage() {
  return (
    <div className="grid w-full gap-4 px-4 pt-4 pb-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:pt-6 xl:grid-cols-[minmax(0,925fr)_minmax(0,473fr)] xl:grid-rows-[minmax(367.5px,auto)_minmax(540px,auto)] xl:gap-x-4 xl:gap-y-[18.5px] xl:pt-[27px] xl:pr-4 xl:pb-[19px] xl:pl-2.5">
      <h1 className="sr-only">{overview.title}</h1>
      <ApiKeysHero />
      <InstancesCard />
      <SubscriptionsPanel />
      {/* Rows sized by the docs cards (their min-heights are the mockup's
          heights). On desktop the stack stretches to the subscriptions
          panel's height, and the two rows share the extra equally. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:gap-4">
        <ProductDocsCard />
        <ApiDocsCard />
      </div>
    </div>
  );
}
