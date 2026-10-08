"use client";

import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { SectionError } from "@/components/patterns/section-boundary";
import { plansPage } from "@/content/copy";
import { AGENT_PLANS_HEADING_ID } from "./parts";

/**
 * "Couldn't load your plan", said once for the page. Its own hairline figure
 * (a vending machine with a stuck item) is still being drawn; no other figure
 * stands in, since every figure is used in exactly one place (AGENTS.md).
 * Try again refreshes the page in a transition, with the orb on the button
 * meanwhile. The notice is rendered from the plan read itself, not caught by
 * a boundary, so it goes away with the first refresh that reads the plan.
 */
export function PlanStateError({ reference }: { reference?: string }) {
  const router = useRouter();
  const noticeRef = useRef<HTMLDivElement>(null);

  // A retry that loads the plan removes this notice with its focused Try
  // again button. Layout cleanup runs while the button is still in the
  // document: hand focus to the plans it was about, not to the page.
  useLayoutEffect(() => {
    const notice = noticeRef.current;
    return () => {
      if (notice?.contains(document.activeElement)) {
        document.getElementById(AGENT_PLANS_HEADING_ID)?.focus();
      }
    };
  }, []);

  return (
    <div ref={noticeRef} className="rounded-card border border-line bg-panel">
      <SectionError
        figure="vending"
        title={plansPage.error.title}
        body={plansPage.error.body}
        reference={reference}
        retry={() => router.refresh()}
        className="min-h-0 py-7"
      />
    </div>
  );
}
