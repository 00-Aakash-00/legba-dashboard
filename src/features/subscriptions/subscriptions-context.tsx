"use client";

import {
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useRef,
  useState,
} from "react";
import type { subscriptions } from "@/content/copy";

export type SubscriptionStatus = keyof typeof subscriptions.status;
export type SubscriptionFilter = "all" | SubscriptionStatus;

export const FILTERS: readonly SubscriptionFilter[] = [
  "all",
  "active",
  "paused",
  "cancelled",
];

type Edges = { start: boolean; end: boolean };

type SubscriptionsState = {
  filter: SubscriptionFilter;
  setFilter: (filter: SubscriptionFilter) => void;
  /** The filter's trigger, so "Show all" can hand focus back to it. */
  filterRef: RefObject<HTMLButtonElement | null>;
  /** The carousel's scroller while cards are on screen; null otherwise. */
  rail: HTMLElement | null;
  setRail: (rail: HTMLElement | null) => void;
  /** Whether the first and the last card are fully in view. */
  edges: Edges;
  setEdges: (edges: Edges) => void;
};

const SubscriptionsContext = createContext<SubscriptionsState | null>(null);

/**
 * Shared by the prerendered frame (filter, arrows) and the streamed list, so
 * the frame works before the data arrives and the list obeys it after.
 */
export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<SubscriptionFilter>("all");
  const [rail, setRail] = useState<HTMLElement | null>(null);
  const [edges, setEdges] = useState<Edges>({ start: true, end: true });
  const filterRef = useRef<HTMLButtonElement>(null);
  return (
    <SubscriptionsContext
      value={{
        filter,
        setFilter,
        filterRef,
        rail,
        setRail,
        edges,
        setEdges,
      }}
    >
      {children}
    </SubscriptionsContext>
  );
}

export function useSubscriptions() {
  const state = use(SubscriptionsContext);
  if (!state) {
    throw new Error(
      "useSubscriptions must be used inside SubscriptionsProvider",
    );
  }
  return state;
}
