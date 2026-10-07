"use client";

import { Command as CommandPrimitive, useCommandState } from "cmdk";
import {
  ArrowUpRightIcon,
  BookOpenIcon,
  CodeXmlIcon,
  KeyIcon,
  LayersIcon,
  WalletCardsIcon,
} from "lucide-react";
import type { Route } from "next";
import { type ReactNode, useRef, useState } from "react";
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
  "h-10 gap-3 rounded-[10px]! px-3 font-medium text-[14px] text-ink-label tracking-[-0.01em] pointer-coarse:h-12 data-selected:bg-[#1f2123] data-selected:text-bone [&_svg:not([class*='size-'])]:size-[18px] *:[svg]:text-[#8f9499] data-selected:*:[svg]:text-signal";

/**
 * The palette's cmdk body, loaded on first open (lazy chunk). Pages, actions
 * and docs; a filtered search that matches nothing says so and offers to
 * clear it.
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

  return (
    <Command
      loop
      vimBindings={false}
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
          "max-h-none scroll-py-2 overscroll-contain px-2 pb-2",
        )}
      >
        <CommandEmpty className="flex flex-col items-center gap-2 px-6 py-14">
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

        <CommandGroup heading={search.groups.pages} className={groupClassName}>
          {NAV_ITEMS.map((item) => (
            <CommandItem
              key={item.key}
              value={item.label}
              keywords={search.keywords[item.key]}
              onSelect={() => onNavigate(item.href)}
              className={itemClassName}
            >
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
          <CommandItem
            value={search.subscriptions}
            keywords={search.keywords.subscriptions}
            onSelect={() => onNavigate("/subscriptions")}
            className={itemClassName}
          >
            <LayersIcon />
            {search.subscriptions}
          </CommandItem>
        </CommandGroup>

        <CommandGroup
          heading={search.groups.actions}
          className={groupClassName}
        >
          <CommandItem
            value={search.actions.createKey}
            keywords={search.keywords.createKey}
            onSelect={() => onNavigate("/api-keys")}
            className={itemClassName}
          >
            <KeyIcon />
            {search.actions.createKey}
          </CommandItem>
          <CommandItem
            value={search.actions.topUp}
            keywords={search.keywords.topUp}
            onSelect={onTopUp}
            className={itemClassName}
          >
            <WalletCardsIcon />
            {search.actions.topUp}
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading={search.groups.docs} className={groupClassName}>
          <ExternalItem
            value={search.docs.product}
            keywords={search.keywords.product}
            icon={<BookOpenIcon />}
            onSelect={() => onOpenExternal(links.docs)}
          />
          <ExternalItem
            value={search.docs.api}
            keywords={search.keywords.api}
            icon={<CodeXmlIcon />}
            onSelect={() => onOpenExternal(links.apiDocs)}
          />
        </CommandGroup>
      </CommandList>
      <ResultsStatus query={query} />
    </Command>
  );
}

function ExternalItem({
  value,
  keywords,
  icon,
  onSelect,
}: {
  value: string;
  keywords: string[];
  icon: ReactNode;
  onSelect: () => void;
}) {
  return (
    <CommandItem
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className={itemClassName}
    >
      {icon}
      {value}
      <CommandShortcut className="flex items-center tracking-normal">
        <ArrowUpRightIcon aria-hidden className="size-4" />
        <span className="sr-only">{search.newTab}</span>
      </CommandShortcut>
    </CommandItem>
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
