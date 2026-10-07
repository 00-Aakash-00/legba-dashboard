"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { catchError, type ErrorInfo } from "next/error";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { search } from "@/content/copy";
import { topUpDialog, topUpForm } from "@/features/billing/top-up";
import { cn } from "@/lib/utils";
import { paletteBody, paletteDialog } from "./palette";
import type { PaletteActions } from "./palette-body";
import {
  PaletteInputRow,
  paletteBodyClassName,
  paletteInputClassName,
} from "./palette-frame";

type DraftProps = { draft: string; onDraftChange: (value: string) => void };

/**
 * The command palette root (mounted once, in the header). The frame is part
 * of the shell bundle, so ⌘K answers instantly; the cmdk body is a separate
 * chunk loaded on first open. Until it arrives the frame keeps a working
 * input (typing isn't lost) and, after 200ms, the orb. If the chunk fails,
 * the frame says so and retries in place. Never animated (emil: ⌘K).
 */
export function CommandPalette() {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const afterClose = useRef<(() => void) | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.isComposing ||
        event.defaultPrevented
      ) {
        return;
      }
      // Another modal (top-up, create key) keeps the keyboard until it closes.
      if (!paletteDialog.isOpen && anotherModalIsOpen()) return;
      event.preventDefault();
      if (event.repeat) return;
      if (paletteDialog.isOpen) paletteDialog.close();
      else paletteDialog.open(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Activity hides the shell on some navigations: never return to an open palette.
  useLayoutEffect(() => () => paletteDialog.close(), []);

  const actions: PaletteActions = {
    onNavigate(href) {
      paletteDialog.close();
      router.push(href);
    },
    onTopUp() {
      topUpForm.preload();
      // Open the next modal once this one has fully closed and handed focus back.
      afterClose.current = () => topUpDialog.open(null);
      paletteDialog.close();
    },
    onOpenExternal(url) {
      window.open(url, "_blank", "noopener,noreferrer");
      paletteDialog.close();
    },
  };

  return (
    <Dialog
      handle={paletteDialog}
      onOpenChange={(open) => {
        // A fresh open retries a chunk that failed before; closing drops the draft.
        if (open) paletteBody.retry();
        else setDraft("");
      }}
      onOpenChangeComplete={(open) => {
        if (open) return;
        const next = afterClose.current;
        afterClose.current = null;
        next?.();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-black/55 duration-0 supports-backdrop-filter:backdrop-blur-[2px]" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#141516] pt-[env(safe-area-inset-top,0px)] pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] text-ink outline-none",
            "lg:-translate-x-1/2 lg:inset-auto lg:top-[min(14vh,128px)] lg:left-1/2 lg:w-[min(600px,calc(100vw-2rem))] lg:rounded-[18px] lg:p-0 lg:shadow-[0_32px_80px_-24px_rgb(0_0_0/0.85)] lg:ring-1 lg:ring-line-strong",
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {search.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {search.description}
          </DialogPrimitive.Description>
          <PaletteBoundary draft={draft} onDraftChange={setDraft}>
            <Suspense
              fallback={
                <PaletteShell draft={draft} onDraftChange={setDraft}>
                  <p
                    role="status"
                    className="pending-delay flex items-center gap-2.5 text-[14px] text-muted-foreground"
                  >
                    <Spinner tone="accent" />
                    {search.loading}
                  </p>
                </PaletteShell>
              }
            >
              <PaletteContent initialQuery={draft} {...actions} />
            </Suspense>
          </PaletteBoundary>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}

function PaletteContent(props: PaletteActions & { initialQuery: string }) {
  const { PaletteBody } = use(paletteBody.load());
  return <PaletteBody {...props} />;
}

/** The frame while the body is loading or failed: a live input and one message. */
function PaletteShell({
  draft,
  onDraftChange,
  children,
}: DraftProps & { children: ReactNode }) {
  return (
    <>
      <PaletteInputRow>
        <input
          // biome-ignore lint/a11y/noAutofocus: the palette exists to be typed into.
          autoFocus
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={search.placeholder}
          aria-label={search.title}
          autoComplete="off"
          spellCheck={false}
          className={paletteInputClassName}
        />
      </PaletteInputRow>
      <div
        className={cn(
          paletteBodyClassName,
          "flex flex-col items-center justify-center gap-4 px-6 text-center",
        )}
      >
        {children}
      </div>
    </>
  );
}

// camelCase on purpose: catchError calls this as a function, not a component.
function renderPaletteError(props: DraftProps, { reset }: ErrorInfo) {
  return (
    <PaletteShell {...props}>
      <p
        role="alert"
        className="max-w-xs text-[14px] text-muted-foreground leading-relaxed"
      >
        {search.loadFailed}
      </p>
      <Button
        variant="wine"
        size="pill-md"
        onClick={() => {
          paletteBody.retry();
          reset();
        }}
      >
        {search.retry}
      </Button>
    </PaletteShell>
  );
}

const PaletteBoundary = catchError(renderPaletteError);

// Base UI marks open popups with data-open (it doesn't set aria-modal).
function anotherModalIsOpen() {
  return (
    document.querySelector(
      '[role="dialog"][data-open], [role="alertdialog"][data-open]',
    ) !== null
  );
}
