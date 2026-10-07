"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { workspace } from "@/content/copy";
import { cn } from "@/lib/utils";

export type CopyState = "idle" | "pending" | "copied" | "failed";

/** Selects the text of the element with this id, for copying by hand. */
export function selectText(id: string) {
  const node = document.getElementById(id);
  if (node) window.getSelection()?.selectAllChildren(node);
}

/**
 * Clipboard writes with feedback: pending (orb only past 200ms), copied for
 * 2s, or failed. A failure (blocked permission, insecure origin, no
 * Clipboard API) runs `select`, so copying by hand is one keystroke away.
 */
export function useCopy() {
  const [state, setState] = useState<CopyState>("idle");

  useEffect(() => {
    if (state !== "copied") return;
    const timer = window.setTimeout(() => setState("idle"), 2000);
    return () => window.clearTimeout(timer);
  }, [state]);

  async function copy(text: string, select: () => void) {
    setState("pending");
    try {
      if (!navigator.clipboard) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      select();
      setState("failed");
    }
  }

  return { state, copy, reset: () => setState("idle") };
}

/**
 * Text-only copy button (icons live in the nav bar only). `what` names the
 * copied thing for assistive tech ("Copy cURL sample"), and the polite live
 * region says how it went. A copy that takes past 200ms swaps the label for
 * the orb (20px, centred) in place, so nothing moves; a fast one shows no orb.
 */
export function CopyButton({
  state,
  what,
  onCopy,
  className,
}: {
  state: CopyState;
  what: string;
  onCopy: () => void;
  className?: string;
}) {
  const copy = workspace.copy;
  const pending = state === "pending";
  return (
    <>
      <Button
        variant="outline-pill"
        size="pill-md"
        aria-busy={pending || undefined}
        onClick={onCopy}
        className={cn(
          "relative min-w-[5.25rem] px-4 text-[13px] data-copied:border-ok/40 data-copied:text-ok",
          className,
        )}
        data-copied={state === "copied" || undefined}
      >
        {pending ? (
          <Spinner className="pending-delay absolute inset-0 m-auto" />
        ) : null}
        {/* Fades out as the orb fades in (both after 200ms); a fast copy
            cancels the fade before it starts. Still read while hidden. */}
        <span className="transition-opacity duration-150 ease-out-strong group-aria-busy/button:opacity-0 group-aria-busy/button:delay-200">
          {state === "copied" ? copy.copied : copy.label}
        </span>
        {state === "copied" ? null : <span className="sr-only"> {what}</span>}
      </Button>
      <output aria-live="polite" className="sr-only">
        {state === "copied"
          ? copy.done(what)
          : state === "failed"
            ? `${copy.failed} ${copy.failedHint}`
            : ""}
      </output>
    </>
  );
}

/** Shown under the copied text when the clipboard refused. */
export function CopyFailed({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "font-medium text-[13px] text-ink-2 leading-5 tracking-[-0.01em]",
        className,
      )}
    >
      <span className="text-[#f2788a]">{workspace.copy.failed}</span>{" "}
      {workspace.copy.failedHint}
    </p>
  );
}
