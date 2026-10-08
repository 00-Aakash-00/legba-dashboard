"use client";

import {
  Command as CommandPrimitive,
  defaultFilter,
  useCommandState,
} from "cmdk";
import type { Route } from "next";
import { useRef, useState } from "react";
import { HairlineFigure } from "@/components/hairline/hairline-figure";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { links, search } from "@/content/copy";
import { NAV_ITEMS } from "@/features/shell/nav";
import { cn } from "@/lib/utils";
import {
  PaletteInputRow,
  paletteBodyClassName,
  paletteInputClassName,
} from "./palette-frame";

export type PaletteActions = {
  onNavigate: (href: Route) => void;
  onTopUp: () => void;
  onOpenExternal: (url: string) => void;
};

const groupClassName =
  "p-0 pt-1.5 **:[[cmdk-group-heading]]:px-3 **:[[cmdk-group-heading]]:pt-2 **:[[cmdk-group-heading]]:pb-1.5 **:[[cmdk-group-heading]]:font-semibold **:[[cmdk-group-heading]]:text-[11px] **:[[cmdk-group-heading]]:text-ink-subtle **:[[cmdk-group-heading]]:uppercase **:[[cmdk-group-heading]]:tracking-[0.08em]";

const itemClassName =
  "h-10 gap-3 rounded-[10px]! px-3 font-medium text-[14px] text-ink-label tracking-[-0.01em] pointer-coarse:h-12 data-selected:bg-[#1f2123] data-selected:text-bone";

type Entry = {
  label: string;
  /** Extra words it answers to (matched, never shown). */
  keywords: string[];
  onSelect: () => void;
  /** Opens the website in a new tab. */
  external?: boolean;
};

type Group = { heading: string; entries: Entry[] };

/**
 * cmdk's ranking (its default scorer): matches only, best first, and groups
 * by their best match. Done here because cmdk 1.1.1 never reorders groups
 * and leaves rows a query brings back (after Backspace or a paste) unsorted,
 * so a weak match could sit on top and take Enter.
 */
function rank(groups: Group[], query: string): Group[] {
  if (!query) return groups;
  return groups
    .map(({ heading, entries }) => {
      const scored = entries
        .map((entry) => ({
          entry,
          score: defaultFilter(entry.label, query, entry.keywords),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score);
      return {
        heading,
        entries: scored.map(({ entry }) => entry),
        best: scored[0]?.score ?? 0,
      };
    })
    .filter(({ best }) => best > 0)
    .sort((a, b) => b.best - a.best);
}

/**
 * The palette's cmdk body, loaded on first open (lazy chunk). Pages, actions
 * and docs, as text (icons belong to the navigation); a filtered search that
 * matches nothing says so and offers to clear it.
 */
export function PaletteBody({
  initialQuery,
  onNavigate,
  onTopUp,
  onOpenExternal,
}: PaletteActions & { initialQuery: string }) {
  // Starts from whatever was typed while this chunk was loading.
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const groups: Group[] = [
    {
      heading: search.groups.pages,
      entries: [
        ...NAV_ITEMS.map((item) => ({
          label: item.label,
          keywords: search.keywords[item.key],
          onSelect: () => onNavigate(item.href),
        })),
        {
          label: search.plans,
          keywords: search.keywords.plans,
          onSelect: () => onNavigate("/plans"),
        },
      ],
    },
    {
      heading: search.groups.actions,
      entries: [
        {
          label: search.actions.createKey,
          keywords: search.keywords.createKey,
          onSelect: () => onNavigate("/api-keys"),
        },
        {
          label: search.actions.topUp,
          keywords: search.keywords.topUp,
          onSelect: onTopUp,
        },
      ],
    },
    {
      heading: search.groups.docs,
      entries: [
        {
          label: search.docs.api,
          keywords: search.keywords.api,
          onSelect: () => onOpenExternal(links.apiDocs),
          external: true,
        },
        {
          label: search.docs.skill,
          keywords: search.keywords.skill,
          onSelect: () => onNavigate("/agent-skill"),
        },
        {
          label: search.docs.product,
          keywords: search.keywords.product,
          onSelect: () => onOpenExternal(links.docs),
          external: true,
        },
      ],
    },
  ];

  return (
    <Command
      loop
      vimBindings={false}
      // Ranked by rank(); cmdk still owns selection and keyboard movement.
      shouldFilter={false}
      label={search.title}
      className="min-h-0 flex-1 rounded-none! bg-transparent p-0"
    >
      <PaletteInputRow>
        <CommandPrimitive.Input
          ref={inputRef}
          autoFocus
          value={query}
          onValueChange={setQuery}
          placeholder={search.placeholder}
          className={paletteInputClassName}
          onFocus={(event) => {
            const end = event.currentTarget.value.length;
            event.currentTarget.setSelectionRange(end, end);
          }}
        />
      </PaletteInputRow>
      <CommandList
        className={cn(
          paletteBodyClassName,
          "max-h-none scroll-py-2 overscroll-contain px-2 pb-2 [&>[cmdk-list-sizer]]:flex [&>[cmdk-list-sizer]]:min-h-full [&>[cmdk-list-sizer]]:flex-col",
        )}
      >
        <CommandEmpty className="my-auto flex flex-col items-center gap-2 px-6 py-10">
          <HairlineFigure kind="blanksheet" decorative className="mb-3 h-26" />
          <p className="font-semibold text-[15px] text-bone tracking-[-0.01em]">
            {search.empty(query)}
          </p>
          <p className="max-w-xs text-[13px] text-muted-foreground leading-relaxed">
            {search.emptyHint}
          </p>
          <Button
            variant="wine"
            size="pill-md"
            className="mt-2"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            {search.clear}
          </Button>
        </CommandEmpty>

        {rank(groups, query).map(({ heading, entries }) => (
          <CommandGroup
            key={heading}
            heading={heading}
            className={groupClassName}
          >
            {entries.map((entry) => (
              <CommandItem
                key={entry.label}
                value={entry.label}
                onSelect={entry.onSelect}
                className={itemClassName}
              >
                {entry.label}
                {/* A link out to the website says in text that it leaves the dashboard. */}
                {entry.external ? (
                  <CommandShortcut className="font-normal text-[12px] tracking-normal">
                    {search.newTab}
                  </CommandShortcut>
                ) : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
      <ResultsStatus query={query} />
    </Command>
  );
}

/** cmdk's empty state isn't announced (role="presentation"): say it here. */
function ResultsStatus({ query }: { query: string }) {
  const empty = useCommandState((state) => state.filtered.count === 0);
  return (
    <p role="status" className="sr-only">
      {empty && query ? search.empty(query) : ""}
    </p>
  );
}
