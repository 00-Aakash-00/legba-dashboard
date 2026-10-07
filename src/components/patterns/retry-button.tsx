"use client";

import { RotateCcwIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { states } from "@/content/copy";
import { cn } from "@/lib/utils";

/**
 * "Try again" for error pages: runs Next's `retry()` (re-fetch and re-render
 * the failed segment) in a transition, with the orb while it works.
 */
export function RetryButton({
  retry,
  className,
}: {
  retry: () => void;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="pill-red"
      size="pill-lg"
      disabled={pending}
      focusableWhenDisabled
      aria-busy={pending || undefined}
      onClick={() => startTransition(retry)}
      className={cn(
        "px-6 data-disabled:opacity-90 pointer-coarse:h-12",
        className,
      )}
    >
      {pending ? (
        <Spinner className="pending-delay" />
      ) : (
        <RotateCcwIcon aria-hidden className="size-[17px]" />
      )}
      {pending ? states.retrying : states.retry}
    </Button>
  );
}
