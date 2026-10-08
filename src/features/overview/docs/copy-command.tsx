"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { overview, workspace } from "@/content/copy";
import { CopyFailed, useCopy } from "@/features/developers/copy-button";
import { INSTALL_COMMAND } from "@/features/developers/samples";
import { cn } from "@/lib/utils";

/**
 * The agent skill's install command, drawn like the API card's code panel: a
 * header strip (a label saying the command is a placeholder, and a text Copy
 * button) over one mono line in the panel's token colours (the purple lifted
 * to 4.5:1 for small text; the Copy label is the selected tab's red). The
 * command is selectable (one click selects all of it). Copying is the app's
 * shared copy flow (useCopy, workspace.copy): busy while the clipboard works
 * (the orb shows only past 200ms), then "Copied" on the button and a polite
 * announcement. If the clipboard is blocked, the command is selected for a
 * manual copy and a note under the panel says so, until the selection moves
 * off the command. The type size follows the panel's width (`--cmd-w`, set by
 * the card) so the command always fits on one line; a last-resort scroll
 * keeps it inside the panel on the narrowest screens.
 */
export function CopyCommand({ className }: { className?: string }) {
  const copy = overview.docs.skill;
  const commandRef = useRef<HTMLElement>(null);
  const { state, copy: copyText, reset } = useCopy();
  const [bin, ...args] = INSTALL_COMMAND.split(" ");
  const pkg = args.pop();

  function selectCommand() {
    const command = commandRef.current;
    if (command) window.getSelection()?.selectAllChildren(command);
  }

  // The failure note says the command is selected. Once it no longer is (a
  // click elsewhere, a new selection), the note would be false, so the panel
  // goes back to idle.
  const onSelectionChange = useEffectEvent(() => {
    if (!String(window.getSelection()).includes(INSTALL_COMMAND)) reset();
  });

  useEffect(() => {
    if (state !== "failed") return;
    // Check once on (re)subscribing too: while this route sat hidden in
    // <Activity> (another tab), the listener was gone and the selection may
    // have moved.
    onSelectionChange();
    document.addEventListener("selectionchange", onSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", onSelectionChange);
  }, [state]);

  return (
    <div className={className}>
      <div className="w-(--cmd-w) max-w-full rounded-[10px] border border-line-soft bg-code">
        <div className="flex h-[26px] items-center justify-between rounded-t-[9px] border-[#18191b] border-b bg-[#0f1011] pr-[3px] pl-2.5 shadow-[0_1px_0_rgb(0_0_0/0.22)]">
          <span className="font-medium text-[10.5px] text-ink-subtle leading-none tracking-[-0.03em]">
            {copy.label}
          </span>
          <Button
            variant="icon-ghost"
            size="xs"
            aria-busy={state === "pending" || undefined}
            onClick={() => {
              if (state !== "pending") copyText(INSTALL_COMMAND, selectCommand);
            }}
            className={cn(
              "relative h-5 rounded-[6px] px-[7px] font-semibold text-[10.5px] tracking-[-0.02em] motion-reduce:active:not-aria-[haspopup]:scale-100 pointer-coarse:after:absolute pointer-coarse:after:-inset-x-1 pointer-coarse:after:-inset-y-3",
              state === "copied"
                ? "text-ok hover:text-ok"
                : "text-[#d65a66] hover:text-[#ec6c78]",
            )}
          >
            {state === "pending" ? (
              <Spinner
                tone="accent"
                className="pending-delay -translate-y-1/2 absolute top-1/2 right-full mr-1"
              />
            ) : null}
            {state === "copied" ? (
              workspace.copy.copied
            ) : (
              <>
                {workspace.copy.label}
                <span className="sr-only"> {copy.copyName}</span>
              </>
            )}
          </Button>
        </div>
        <code
          ref={commandRef}
          translate="no"
          className="block select-all overflow-x-auto whitespace-pre px-2.5 py-[7px] font-medium font-mono text-[#b2b1af] text-[length:clamp(9.5px,calc((var(--cmd-w)-22px)/19.4),12px)] leading-[1.5] [scrollbar-width:none] selection:bg-signal/40"
        >
          <span className="text-[#a7746b]">{bin}</span> {args.join(" ")}{" "}
          <span className="text-[#a46ba2]">{pkg}</span>
        </code>
      </div>
      {/* Always mounted so what it says is announced. The confirmation is
          spoken only (the button says Copied); the failure shows the app's
          copy-failure note under the panel, set at 12px so it stays on two
          lines and fits within the card's mockup height (desktop cards are
          never shorter), so the card keeps its height. */}
      <div aria-live="polite">
        {state === "failed" ? (
          <CopyFailed className="mt-1 w-(--cmd-w) max-w-full text-[12px] leading-4 tracking-[-0.02em]" />
        ) : (
          <span className="sr-only">
            {state === "copied" ? workspace.copy.done(copy.copyName) : ""}
          </span>
        )}
      </div>
    </div>
  );
}
