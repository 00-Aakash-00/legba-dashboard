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
import { plansPage } from "@/content/copy";
import { cn } from "@/lib/utils";
import { type SwitchablePlanId, switchAgentPlan } from "./actions";
import {
  ConfirmDialog,
  callPlanAction,
  type Failure,
  fromKeyboard,
} from "./confirm-dialog";
import { Price, planNameClass, TierMark } from "./parts";

export type SwitchTarget = {
  id: SwitchablePlanId;
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  featured: boolean;
};

/** A switch to a smaller plan: the plan that ends, and what the switch takes away. */
export type Downgrade = { from: string; consequence: string };

/**
 * A column's button. It is one element in every state, so when a switch
 * succeeds and the refreshed page marks this plan as current, focus stays on
 * the same button, which now reads "Current plan" (disabled, still focusable).
 */
export function AgentPlanCta({
  plan,
  current,
  downgrade,
}: {
  plan: SwitchTarget;
  /** This is the plan the account is on. */
  current: boolean;
  /** The account is on a bigger plan. Unknown (undefined) when the plan read failed. */
  downgrade?: Downgrade;
}) {
  const copy = plansPage.switchPlan;
  const router = useRouter();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  /**
   * The downgrade the open dialog confirms, fixed when it opens: the refresh
   * that lands with a successful switch must not change the dialog (or swap
   * it for the other one) while it closes.
   */
  const [confirming, setConfirming] = useState<Downgrade>();
  const [keyboard, setKeyboard] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [pending, startSwitch] = useTransition();
  const shown = useRef(false);
  /** A success to announce once the dialog has closed over the new page. */
  const announce = useRef<string | null>(null);

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
      setOpen(false);
    };
  }, []);

  function confirm() {
    setFailure(null);
    startSwitch(async () => {
      const outcome = await callPlanAction(
        () => switchAgentPlan(plan.id),
        copy,
      );
      if (!outcome.ok) {
        if (shown.current) setFailure(outcome.failure);
        else toast.error(outcome.failure.message, { icon: null });
        return;
      }
      if (!shown.current) {
        toast.success(copy.done(plan.name), { icon: null });
        return;
      }
      // The refresh and the close share one transition, so the dialog closes
      // onto the page that already shows the new plan, and the toast (which
      // outlives the dialog) follows once it has closed.
      announce.current = copy.done(plan.name);
      startTransition(() => {
        router.refresh();
        setOpen(false);
      });
    });
  }

  function onClosed() {
    if (!announce.current) return;
    toast.success(announce.current, { icon: null });
    announce.current = null;
  }

  // A downgrade takes something away, so it confirms in an alert dialog. Two
  // dialogs, so each keeps its own root (and its animations) as `confirming` changes.
  const dialog = {
    onOpenChange: (next: boolean, fromKeys: boolean) => {
      setKeyboard(fromKeys);
      setOpen(next);
    },
    keyboard,
    pending,
    failure,
    finalFocus: buttonRef,
    title: copy.title(plan.name),
    summary: (
      <div className="flex items-center justify-between gap-4">
        <span className="flex min-w-0 items-center gap-2.5">
          <TierMark tier={plan.id} />
          <span className={planNameClass}>{plan.name}</span>
        </span>
        <Price
          size="md"
          price={plan.price}
          suffix={plan.priceSuffix}
          className="shrink-0"
        />
      </div>
    ),
    note: copy.note,
    confirmLabel: copy.confirm(plan.name),
    pendingLabel: copy.pending,
    onConfirm: confirm,
    onClosed,
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant={plan.featured && !current ? "pill-red" : "outline-pill"}
        size="pill-lg"
        disabled={current}
        focusableWhenDisabled
        aria-haspopup={current ? undefined : "dialog"}
        onClick={(event) => {
          setConfirming(downgrade);
          setKeyboard(fromKeyboard(event.nativeEvent));
          setFailure(null);
          setOpen(true);
        }}
        className={cn(
          "w-full",
          current &&
            "cursor-default border-line bg-white/[0.025] text-ink-2 data-disabled:opacity-100",
        )}
      >
        {current ? plansPage.current : plansPage.agent.choose(plan.name)}
      </Button>
      <ConfirmDialog
        {...dialog}
        open={open && !confirming}
        description={plan.description}
        cancelLabel={copy.cancel}
      />
      <ConfirmDialog
        {...dialog}
        alert
        open={open && confirming !== undefined}
        description={confirming?.consequence}
        cancelLabel={confirming ? copy.keep(confirming.from) : copy.cancel}
      />
    </>
  );
}
