"use client";

import { useRouter } from "next/navigation";
import {
  startTransition,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { extensionPlan, plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import { cancelExtensionPlan, startExtensionTrial } from "./actions";
import {
  ConfirmDialog,
  callPlanAction,
  type Failure,
  fromKeyboard,
} from "./confirm-dialog";
import { planNameClass, TierMark } from "./parts";

type Flow = "trial" | "cancel";

/**
 * The extension's plan action: "Start free trial" while inactive, "Cancel
 * plan" while active. One button for both, so focus stays on it when the
 * refreshed page swaps the label after a change.
 */
export function ExtensionActions({
  status,
}: {
  status: "active" | "inactive";
}) {
  const copy = plansPage.extension;
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [pending, startChange] = useTransition();
  const shown = useRef(false);
  /** A success to announce once its dialog has closed over the new page. */
  const announce = useRef<string | null>(null);
  const active = status === "active";

  // Activity hides this route without unmounting it: never come back to an
  // open dialog. Outcomes that can't show here any more go to a toast.
  useLayoutEffect(() => {
    shown.current = true;
    return () => {
      shown.current = false;
      if (announce.current) {
        toast.success(announce.current, { icon: null });
        announce.current = null;
      }
      setFlow(null);
    };
  }, []);

  function confirm(which: Flow) {
    const text = which === "trial" ? copy.trial : copy.cancelPlan;
    setFailure(null);
    startChange(async () => {
      const outcome = await callPlanAction(
        which === "trial" ? startExtensionTrial : cancelExtensionPlan,
        text,
      );
      if (!outcome.ok) {
        if (shown.current) setFailure(outcome.failure);
        else toast.error(outcome.failure.message, { icon: null });
        return;
      }
      if (!shown.current) {
        toast.success(text.done, { icon: null });
        return;
      }
      // Refreshes and closes in one transition, so the dialog closes onto the
      // new status; the toast follows the close.
      announce.current = text.done;
      startTransition(() => {
        router.refresh();
        setFlow(null);
      });
    });
  }

  function onClosed() {
    if (!announce.current) return;
    toast.success(announce.current, { icon: null });
    announce.current = null;
  }

  function onOpenChange(which: Flow) {
    return (next: boolean, fromKeys: boolean) => {
      setKeyboard(fromKeys);
      setFlow(next ? which : null);
    };
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant={active ? "outline-pill" : "pill-red"}
        size="pill-lg"
        aria-haspopup="dialog"
        onClick={(event) => {
          setKeyboard(fromKeyboard(event.nativeEvent));
          setFailure(null);
          setFlow(active ? "cancel" : "trial");
        }}
        className={cn(
          // From 640px at least as wide as its skeleton (sm:w-44), so either
          // label lands in the skeleton's place and "Add to Chrome" stays put.
          "max-sm:w-full sm:min-w-44",
          active && "hover:border-signal/60 hover:text-signal",
        )}
      >
        {active ? copy.cancel : copy.startTrial}
      </Button>
      <ConfirmDialog
        open={flow === "trial"}
        onOpenChange={onOpenChange("trial")}
        keyboard={keyboard}
        pending={pending}
        failure={failure}
        finalFocus={buttonRef}
        title={copy.trial.title}
        description={extensionPlan.trial}
        summary={
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <span className="flex items-center gap-2.5">
              <TierMark tier="extension" />
              <span className={planNameClass}>{extensionPlan.modes}</span>
            </span>
            <span className="font-medium text-[14px] text-ink-2 tabular-nums">
              <span aria-hidden>{copy.trial.price}</span>
              <span className="sr-only">{copy.trial.priceSpoken}</span>
            </span>
          </div>
        }
        note={copy.trial.note}
        cancelLabel={copy.trial.cancel}
        confirmLabel={copy.trial.confirm}
        pendingLabel={copy.trial.pending}
        onConfirm={() => confirm("trial")}
        onClosed={onClosed}
      />
      <ConfirmDialog
        alert
        open={flow === "cancel"}
        onOpenChange={onOpenChange("cancel")}
        keyboard={keyboard}
        pending={pending}
        failure={failure}
        finalFocus={buttonRef}
        title={copy.cancelPlan.title}
        description={copy.cancelPlan.body}
        cancelLabel={copy.cancelPlan.keep}
        confirmLabel={copy.cancelPlan.confirm}
        pendingLabel={copy.cancelPlan.pending}
        onConfirm={() => confirm("cancel")}
        onClosed={onClosed}
      />
    </>
  );
}
