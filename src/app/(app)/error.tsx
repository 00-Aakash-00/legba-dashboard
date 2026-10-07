"use client";

import { TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { RetryButton } from "@/components/patterns/retry-button";
import { StatusScreen } from "@/components/patterns/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { errorPages } from "@/content/copy";
import { cn } from "@/lib/utils";

/** A page inside the app failed; the shell (header, navigation) stays usable. */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const copy = errorPages.app;
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] w-full flex-col px-4">
      <StatusScreen
        icon={TriangleAlertIcon}
        eyebrow={copy.eyebrow}
        title={copy.heading}
        body={copy.body}
        reference={error.digest}
        actions={
          <>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline-pill", size: "pill-lg" }),
                "px-6 pointer-coarse:h-12",
              )}
            >
              {copy.action}
            </Link>
            <RetryButton retry={retry} />
          </>
        }
      />
    </div>
  );
}
