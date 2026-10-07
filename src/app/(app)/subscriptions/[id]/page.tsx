import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SectionBoundary } from "@/components/patterns/section-boundary";
import { subscriptions } from "@/content/copy";
import {
  SubscriptionDetail,
  SubscriptionDetailSkeleton,
} from "@/features/subscriptions/subscription-detail";

const { detail } = subscriptions;

export const metadata: Metadata = { title: detail.metaTitle };

/**
 * One subscription. The back link and heading prerender; the param and the
 * session are read inside Suspense, under the section's own error boundary.
 */
export default function SubscriptionPage({
  params,
}: PageProps<"/subscriptions/[id]">) {
  return (
    <div className="w-full px-4 pt-6 pb-10 lg:pt-7 xl:pr-4 xl:pl-2.5">
      <Link
        href="/subscriptions"
        className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-medium text-[14px] text-ink-2 transition-colors duration-150 ease-out-strong hover:text-ink focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:text-ink"
      >
        <ArrowLeftIcon aria-hidden="true" className="size-4" />
        {detail.back}
      </Link>
      <h1 className="mt-4 mb-3 flex items-center gap-3 font-semibold text-[13px] text-ink-3 uppercase tracking-[0.12em]">
        <span
          aria-hidden="true"
          className="size-4 rounded-[4px] bg-signal-strong shadow-[0_0_8px_rgba(253,30,67,0.32)]"
        />
        {detail.eyebrow}
      </h1>
      <SectionBoundary
        title={detail.error.title}
        body={detail.error.body}
        className="min-h-80 rounded-[20px] border border-line bg-panel"
      >
        <Suspense fallback={<SubscriptionDetailSkeleton />}>
          <SubscriptionDetail params={params} />
        </Suspense>
      </SectionBoundary>
    </div>
  );
}
