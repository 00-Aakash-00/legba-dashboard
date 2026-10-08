"use client";

import Link from "next/link";
import { RetryButton } from "@/components/patterns/retry-button";
import {
  StandaloneFrame,
  StatusScreen,
} from "@/components/patterns/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { errorPages } from "@/content/copy";
import { cn } from "@/lib/utils";

/**
 * A layout below the root failed (the app shell or the auth frame), so there
 * is no shell to keep: render the message in a minimal frame of its own.
 */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const copy = errorPages.app;
  return (
    <StandaloneFrame>
      <StatusScreen
        figure="breaker"
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
    </StandaloneFrame>
  );
}
