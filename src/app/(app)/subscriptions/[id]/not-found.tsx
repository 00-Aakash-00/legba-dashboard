import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { subscriptions } from "@/content/copy";
import { PlanFigure } from "@/features/subscriptions/plan-figure";
import { cn } from "@/lib/utils";

const { notFound } = subscriptions.detail;

/** An id that isn't on this account: say so, and lead back to the list. */
export default function SubscriptionNotFound() {
  return (
    <div className="w-full px-4 pt-6 pb-10 lg:pt-7 xl:pr-4 xl:pl-2.5">
      <Empty className="min-h-96 gap-5 rounded-[20px] border border-line border-solid bg-panel px-6 py-12">
        <EmptyHeader>
          <EmptyMedia>
            <PlanFigure plan="ghost" />
          </EmptyMedia>
          <h1 className="font-semibold text-[22px] text-ink leading-7 tracking-[-0.03em]">
            {notFound.title}
          </h1>
          <EmptyDescription className="text-ink-2">
            {notFound.body}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href="/subscriptions"
            className={cn(
              buttonVariants({ variant: "wine", size: "pill-md" }),
              "pointer-coarse:h-11",
            )}
          >
            {notFound.action}
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  );
}
