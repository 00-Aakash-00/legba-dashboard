import { ArrowRightIcon, CompassIcon } from "lucide-react";
import Link from "next/link";
import { StatusScreen } from "@/components/patterns/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { errorPages } from "@/content/copy";
import { cn } from "@/lib/utils";

/** notFound() inside the app (e.g. a subscription that isn't yours): the shell stays. */
export default function AppNotFound() {
  const copy = errorPages.notFound;
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] w-full flex-col px-4">
      <StatusScreen
        icon={CompassIcon}
        eyebrow={copy.eyebrow}
        title={copy.heading}
        body={copy.body}
        actions={
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "pill-red", size: "pill-lg" }),
              "px-6 pointer-coarse:h-12",
            )}
          >
            {copy.action}
            <ArrowRightIcon aria-hidden className="size-[18px]" />
          </Link>
        }
      />
    </div>
  );
}
