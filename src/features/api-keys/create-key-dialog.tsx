"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { catchError, type ErrorInfo } from "next/error";
import { useRouter } from "next/navigation";
import {
  type ReactElement,
  Suspense,
  startTransition,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { apiKeys, states } from "@/content/copy";
import { cn } from "@/lib/utils";
import type { Phase } from "./create-key-flow";
import {
  fromKeyboard,
  sheetBackdrop,
  sheetButton,
  sheetDescription,
  sheetFooter,
  sheetPopup,
  sheetTitle,
} from "./sheet";

/*
 * The dialog's content (form, one-time key, copy) is its own chunk: it loads
 * on first open, and starts loading as soon as the pointer or focus reaches a
 * trigger, so it is normally ready by the time the click lands.
 */
type FlowModule = typeof import("./create-key-flow");
type TrackedPromise<T> = Promise<T> & {
  status?: "pending" | "fulfilled" | "rejected";
  value?: T;
  reason?: unknown;
};

/**
 * The chunk loader retries a failed download indefinitely instead of
 * rejecting, so cap the wait: past the loading ladder's 5–10s rung the
 * dialog says it didn't load and offers a retry instead of spinning on.
 */
const LOAD_TIMEOUT_MS = 8000;

let flowModule: TrackedPromise<FlowModule> | null = null;

function importFlow(): Promise<FlowModule> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("The create-key dialog took too long to load")),
      LOAD_TIMEOUT_MS,
    );
    import("./create-key-flow").then(
      (module) => {
        clearTimeout(timer);
        resolve(module);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function loadFlow(): Promise<FlowModule> {
  if (!flowModule) {
    const loading: TrackedPromise<FlowModule> = importFlow();
    loading.then(
      (module) => {
        // React's `use` reads a settled promise synchronously, so a preloaded
        // module renders in the first frame instead of flashing the fallback.
        loading.status = "fulfilled";
        loading.value = module;
      },
      (error: unknown) => {
        // Kept, not cleared: React re-reads this promise to render the
        // failure. "Try again" (or new intent on a trigger) starts afresh.
        loading.status = "rejected";
        loading.reason = error;
      },
    );
    flowModule = loading;
  }
  return flowModule;
}

function forgetFailedFlow() {
  if (flowModule?.status === "rejected") flowModule = null;
}

function preloadFlow() {
  forgetFailedFlow();
  void loadFlow().catch(() => {
    // Preloading is opportunistic; a failure surfaces (with a retry) on open.
  });
}

export type CreateKeyHandle = DialogPrimitive.Handle<unknown>;

/** One handle links a trigger to its dialog, even when they render apart. */
export function useCreateKeyHandle(): CreateKeyHandle {
  const [handle] = useState(() => DialogPrimitive.createHandle<unknown>());
  return handle;
}

/** Renders `trigger` as the dialog's opener and preloads the content on intent. */
export function CreateKeyTrigger({
  handle,
  trigger,
}: {
  handle: CreateKeyHandle;
  trigger: ReactElement;
}) {
  return (
    <DialogPrimitive.Trigger
      handle={handle}
      render={trigger}
      onPointerEnter={preloadFlow}
      onPointerDown={preloadFlow}
      onFocus={preloadFlow}
    />
  );
}

/**
 * The create-key dialog itself. Stays mounted when its trigger unmounts (the
 * keys list swaps its empty state for the table as soon as the first key
 * exists), so the one-time key survives that re-render. `fallbackFocus`
 * receives focus on close when the trigger is gone.
 */
export function CreateKeyRoot({
  handle,
  fallbackFocus,
}: {
  handle: CreateKeyHandle;
  fallbackFocus?: () => HTMLElement | null;
}) {
  const router = useRouter();
  const phase = useRef<Phase>("form");
  /** Name of a key created in this session (never the secret), for the toast. */
  const created = useRef<string | null>(null);
  const trigger = useRef<Element | null>(null);
  const popup = useRef<HTMLDivElement>(null);
  const forceClose = useRef(false);
  const [keyboard, setKeyboard] = useState(false);

  function confirmCreated() {
    const name = created.current;
    if (name === null) return;
    created.current = null;
    const onKeysPage = window.location.pathname === "/api-keys";
    toast.success(apiKeys.created.toast, {
      description: name,
      action: onKeysPage
        ? undefined
        : {
            label: apiKeys.created.toastAction,
            onClick: () => router.push("/api-keys"),
          },
    });
  }

  function onOpenChange(
    open: boolean,
    details: DialogPrimitive.Root.ChangeEventDetails,
  ) {
    if (open) {
      trigger.current = details.trigger ?? null;
    } else if (!forceClose.current) {
      // A request is in flight: closing now would lose the key it returns.
      if (phase.current === "pending") {
        details.cancel();
        return;
      }
      // The key is on screen: a stray click outside must not discard it.
      if (phase.current === "created" && details.reason === "outside-press") {
        details.cancel();
        return;
      }
    }
    setKeyboard(fromKeyboard(details.event));
    if (!open) {
      forceClose.current = false;
      phase.current = "form";
      confirmCreated();
    }
  }

  function onCreated(name: string) {
    created.current = name;
    // The list behind the dialog shows the new key while the secret is on screen.
    startTransition(() => router.refresh());
    // Closed while the request was in flight (route hidden): confirm anyway.
    if (!handle.isOpen) confirmCreated();
  }

  // Activity hides this route without unmounting it: close the dialog so it
  // isn't waiting, open, when the user comes back. The content clears the key.
  useLayoutEffect(
    () => () => {
      if (!handle.isOpen) return;
      forceClose.current = true;
      handle.close();
    },
    [handle],
  );

  return (
    <DialogPrimitive.Root handle={handle} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          data-kbd={keyboard || undefined}
          className={sheetBackdrop}
        />
        <DialogPrimitive.Popup
          ref={popup}
          data-kbd={keyboard || undefined}
          className={sheetPopup}
          // The form focuses its Key name field itself, as soon as it exists
          // (pointer, touch or keyboard). Until then (content still loading,
          // or failed) the dialog itself holds focus, not one of its buttons.
          initialFocus={popup}
          finalFocus={() =>
            trigger.current?.isConnected ? true : (fallbackFocus?.() ?? true)
          }
        >
          <LoadBoundary>
            <Suspense fallback={<FlowFallback />}>
              <Flow
                onPhase={(next) => {
                  phase.current = next;
                }}
                onCreated={onCreated}
              />
            </Suspense>
          </LoadBoundary>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Flow(props: {
  onPhase: (phase: Phase) => void;
  onCreated: (name: string) => void;
}) {
  const { CreateKeyFlow } = use(loadFlow());
  return <CreateKeyFlow {...props} />;
}

/**
 * The way out while the content is loading or failed, in the footer. The form
 * has its own Cancel, styled the same, so nothing changes when it arrives.
 */
function CancelButton() {
  return (
    <DialogPrimitive.Close
      render={
        <Button variant="outline-pill" size="pill-md" className={sheetButton} />
      }
    >
      {apiKeys.dialog.cancel}
    </DialogPrimitive.Close>
  );
}

/** Shown only if the content isn't preloaded yet; the orb waits 200ms. */
function FlowFallback() {
  return (
    <div>
      <DialogPrimitive.Title className={sheetTitle}>
        {apiKeys.dialog.title}
      </DialogPrimitive.Title>
      <DialogPrimitive.Description className={sheetDescription}>
        {apiKeys.dialog.description}
      </DialogPrimitive.Description>
      <div
        role="status"
        className="pending-delay mt-8 mb-4 flex items-center gap-3 text-[14px] text-ink-2"
      >
        <Spinner tone="accent" />
        {apiKeys.dialog.loading}
      </div>
      <div className={sheetFooter}>
        <CancelButton />
      </div>
    </div>
  );
}

function renderLoadFailed(_props: object, { reset }: ErrorInfo) {
  return (
    <LoadFailed
      onRetry={() => {
        forgetFailedFlow();
        reset();
      }}
    />
  );
}

/** The content chunk failed to download (offline, deploy in between). */
const LoadBoundary = catchError(renderLoadFailed);

function LoadFailed({ onRetry }: { onRetry: () => void }) {
  return (
    <div>
      <DialogPrimitive.Title className={sheetTitle}>
        {apiKeys.dialog.title}
      </DialogPrimitive.Title>
      <p
        role="alert"
        className="mt-3 font-medium text-[14.5px] text-ink-2 leading-[21px]"
      >
        {apiKeys.dialog.loadFailed}
      </p>
      <div className={sheetFooter}>
        <CancelButton />
        <Button
          variant="pill"
          size="pill-md"
          className={cn(sheetButton, "px-6")}
          onClick={onRetry}
        >
          {states.retry}
        </Button>
      </div>
    </div>
  );
}

/**
 * Contract used by the overview hero and the API keys page header:
 * renders `trigger`; activating it opens the create-key dialog.
 */
export function CreateKeyDialog({ trigger }: { trigger: ReactElement }) {
  const handle = useCreateKeyHandle();
  return (
    <>
      <CreateKeyTrigger handle={handle} trigger={trigger} />
      <CreateKeyRoot handle={handle} />
    </>
  );
}
