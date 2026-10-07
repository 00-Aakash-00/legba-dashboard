"use client";

import { useId, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberedCode } from "./code-lines";
import { CopyButton, CopyFailed, selectText, useCopy } from "./copy-button";

export type CodeTab = {
  id: string;
  label: string;
  code: string;
  /** What a copy copies, for assistive tech ("cURL sample"). */
  name: string;
};

/**
 * A tabbed code panel in the overview code panel's style (bg-code, the dark
 * tab bar, the red active tab) with one Copy button for the selected tab:
 * beside the tabs from 640px, a full-width row under the code on phones (in
 * thumb reach, and the tabs keep the bar). Either way it follows the tabs in
 * the focus order. Selection follows focus (arrow keys, Home/End) and switches
 * instantly. The selected panel is the horizontal scroller and takes focus, so
 * keyboard users can scroll long lines.
 */
export function CodeTabs({
  tabs,
  label,
  tabsLabel,
  className,
}: {
  tabs: CodeTab[];
  /** Names the panel ("Create a session"). */
  label: string;
  /** Names the tab list ("Language"). */
  tabsLabel: string;
  className?: string;
}) {
  const [selected, setSelected] = useState(tabs[0].id);
  const { state, copy, reset } = useCopy();
  const baseId = useId();
  const codeId = (id: string) => `${baseId}-${id}`;
  const current = tabs.find((tab) => tab.id === selected) ?? tabs[0];

  return (
    <div className={className}>
      <section
        aria-label={label}
        // The focused code panel's ring goes on the whole box: an inset outline
        // on the panel would sit under its sticky line numbers.
        className="overflow-hidden rounded-[12px] border border-line-soft bg-code has-[[role=tabpanel]:focus-visible]:outline-2 has-[[role=tabpanel]:focus-visible]:outline-ring has-[[role=tabpanel]:focus-visible]:outline-offset-2"
      >
        <Tabs
          value={current.id}
          onValueChange={(value) => {
            setSelected(String(value));
            // "Copied" belonged to the tab that was showing.
            reset();
          }}
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-0"
        >
          {/* The tabs wrap onto a second row rather than hide past the edge
              on the narrowest screens. */}
          <TabsList
            activateOnFocus
            aria-label={tabsLabel}
            className="col-span-2 h-auto min-h-11 w-full min-w-0 flex-wrap justify-start rounded-none border-[#18191b] border-b bg-[#111213] p-0 group-data-horizontal/tabs:h-auto sm:col-span-1"
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="h-11 flex-none rounded-none border-0 px-3 font-semibold text-[12.5px] text-ink-3 tracking-[-0.02em] transition-colors duration-150 hover:text-[#a6a8ac] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-white/[0.04] data-active:bg-badge data-active:text-[#f0566a] dark:text-ink-3 dark:data-active:bg-badge dark:data-active:text-[#f0566a] dark:hover:text-[#a6a8ac] group-data-[variant=default]/tabs-list:data-active:shadow-none sm:px-4"
              >
                {tab.label}
                {/* The selected tab's underline, on the bar's divider. */}
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[linear-gradient(90deg,transparent,rgb(240_86_106/0.85)_20%,rgb(240_86_106/0.85)_80%,transparent)] opacity-0 in-data-active:opacity-100"
                />
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="order-last col-span-2 border-[#18191b] border-t p-2 sm:order-none sm:col-span-1 sm:flex sm:items-center sm:border-t-0 sm:border-b sm:bg-[#111213] sm:py-0 sm:pr-1.5 sm:pl-2">
            <CopyButton
              state={state}
              what={current.name}
              onCopy={() =>
                copy(current.code, () => selectText(codeId(current.id)))
              }
              // In the bar from 640px it stays 32px high; on touch its hit
              // area grows to 44px, the bar's full height (7px past the
              // padding box, inside the 1px border, on each side).
              className="h-11 w-full sm:h-8 sm:w-auto sm:pointer-coarse:after:absolute sm:pointer-coarse:after:inset-x-0 sm:pointer-coarse:after:-inset-y-[7px]"
            />
          </div>
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="col-span-2 overflow-x-auto overscroll-x-contain py-3.5 font-medium font-mono text-[#b2b1af] text-[12.5px] leading-[21px] outline-none selection:bg-signal/35 [scrollbar-color:#2a2b2d_transparent] [scrollbar-width:thin] data-ending-style:hidden"
            >
              <NumberedCode id={codeId(tab.id)} code={tab.code} />
            </TabsContent>
          ))}
        </Tabs>
      </section>
      {state === "failed" ? <CopyFailed className="mt-2.5" /> : null}
    </div>
  );
}
