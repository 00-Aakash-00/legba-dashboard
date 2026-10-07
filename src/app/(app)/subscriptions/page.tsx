import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { subscriptions } from "@/content/copy";
import { SubscriptionsSection } from "@/features/subscriptions/subscriptions-section";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: subscriptions.pageTitle,
  description: subscriptions.pageDescription,
};

/**
 * Every subscription on the account. The header prerenders; the section
 * streams its count and cards behind its own Suspense and error boundary.
 */
export default function SubscriptionsPage() {
  return (
    <div className="w-full px-4 pt-6 pb-10 lg:pt-7 xl:pr-4 xl:pl-2.5">
      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-semibold text-[28px] text-ink leading-8 tracking-[-0.03em]">
            {subscriptions.pageTitle}
          </h1>
          <p className="mt-1.5 font-medium text-[15px] text-ink-2 leading-[21.5px]">
            {subscriptions.pageDescription}
          </p>
        </div>
        <a
          href={subscriptions.pricing}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "pill-red", size: "pill-md" }),
            "w-full sm:w-auto pointer-coarse:h-11",
          )}
        >
          {subscriptions.pageAction}{" "}
          <span className="sr-only">{subscriptions.newTab}</span>
        </a>
      </header>
      <SubscriptionsSection variant="page" />
    </div>
  );
}
