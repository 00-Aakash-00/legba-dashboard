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
    <div className="mx-auto grid w-full max-w-[1440px] gap-4 px-3.5 pt-7 pb-5 xl:grid-cols-[minmax(0,924fr)_minmax(0,472fr)] xl:gap-x-4 xl:gap-y-5">
      <h1 className="sr-only">{overview.title}</h1>
      <ApiKeysHero />
      <InstancesCard />
      <SubscriptionsPanel />
      <div className="grid gap-4 xl:gap-5">
        <ProductDocsCard />
        <ApiDocsCard />
      </div>
    </div>
  );
}
