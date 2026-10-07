"use client";

import { createContext, type ReactNode, use, useState } from "react";

type Edges = { start: boolean; end: boolean };

type SubscriptionsState = {
  /** The carousel's scroller while cards are on screen; null otherwise. */
  rail: HTMLElement | null;
  setRail: (rail: HTMLElement | null) => void;
  /** Whether the first and the last card are fully in view. */
  edges: Edges;
  setEdges: (edges: Edges) => void;
};

const SubscriptionsContext = createContext<SubscriptionsState | null>(null);

/**
 * Shared by the prerendered frame (Previous / Next) and the streamed cards,
 * so the frame works before the data arrives and drives the row after.
 */
export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [rail, setRail] = useState<HTMLElement | null>(null);
  const [edges, setEdges] = useState<Edges>({ start: true, end: true });
  return (
    <SubscriptionsContext value={{ rail, setRail, edges, setEdges }}>
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
