import { Fragment } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { overview } from "@/content/copy";
import { cn } from "@/lib/utils";
import {
  type CodeSampleId,
  codeSamples,
  type Token,
  type TokenKind,
} from "./code-samples";

const tokenColor: Record<TokenKind, string> = {
  command: "text-[#a7746b]",
  plain: "text-[#b2b1af]",
  url: "text-[#996197]",
  string: "text-[#c22b40]",
  continuation: "text-[#9e5c56]",
};

/** The kind covering most of a line's characters: the line's own colour (the
 * spec's line colour), so only the other tokens need a span. */
function lineKind(tokens: Token[]) {
  const count = new Map<TokenKind, number>();
  for (const [kind, text] of tokens) {
    count.set(kind, (count.get(kind) ?? 0) + text.trim().length);
  }
  return [...count].sort((a, b) => b[1] - a[1])[0][0];
}

// Lines and line numbers are inline-blocks trimmed to their ink (cap height to
// descent; digits have none, and the mockup's digit boxes carry about 1px of
// blur). The line boxes, and so the layout, are unchanged.
const LINE_BOX = "inline-block [text-box:trim-both_cap_text]";
const NUMBER_BOX = "inline-block pb-px [text-box:trim-both_cap_alphabetic]";

// Cell geometry from the mockup: curl's label sits right of its cell's centre,
// Python and JavaScript are padded evenly.
const tabCell: Record<CodeSampleId, string> = {
  curl: "w-[56px] pl-[23.5px]",
  python: "w-[55.5px] pl-[12.2px]",
  javascript: "pr-[13px] pl-[13.2px]",
};

/**
 * The API card's code panel: language tabs (Base UI via shadcn Tabs) over five
 * numbered lines. The panels are static, so selection follows focus (arrow
 * keys, Home/End) and switches instantly, with no animation. The active panel
 * is the horizontal scroller and is focusable, so keyboard users can scroll
 * long lines; line numbers stay put and are left out of copied text.
 */
export function CodeSample() {
  const copy = overview.docs.api;
  return (
    <section
      aria-label={copy.codeLabel}
      className="relative z-10 rounded-[10px] border border-line-soft bg-code"
    >
      <Tabs defaultValue="curl" className="flex-col gap-0">
        <TabsList
          aria-label={copy.tabsLabel}
          activateOnFocus
          className="flex h-9 w-full justify-start rounded-none rounded-t-[9px] border-[#18191b] border-b bg-transparent bg-[linear-gradient(90deg,#0f1011_111.5px,#131415_111.5px)] p-0 shadow-[0_1px_0_rgb(0_0_0/0.22)] group-data-horizontal/tabs:h-9 pointer-coarse:h-11 pointer-coarse:group-data-horizontal/tabs:h-11"
        >
          {codeSamples.map(({ id }) => (
            <TabsTrigger
              key={id}
              value={id}
              className={cn(
                "h-full flex-none justify-start rounded-none border-0 px-0 py-0 font-medium text-[10.5px] text-ink-subtle leading-[13px] tracking-[-0.03em] transition-none first:rounded-tl-[9px] hover:text-[#a6a8ac] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset active:bg-white/[0.04] data-active:bg-badge data-active:font-semibold data-active:text-[#bb4853] pointer-coarse:text-xs dark:text-ink-subtle dark:data-active:bg-badge dark:data-active:text-[#bb4853] dark:hover:text-[#a6a8ac] group-data-[variant=default]/tabs-list:data-active:shadow-none",
                tabCell[id],
              )}
            >
              {/* The selected underline: a faint red line on the divider that
                  fades at both ends, under the label only. */}
              <span className="relative flex h-full items-center pt-[2px] after:absolute after:-right-[5.5px] after:-bottom-px after:-left-[3.5px] after:h-[2px] after:bg-[linear-gradient(90deg,transparent,rgb(187_72_83/0.2)_18%,rgb(187_72_83/0.2)_62%,transparent)] after:opacity-0 in-data-active:after:opacity-100">
                {copy.languages[id]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {codeSamples.map(({ id, lines }) => (
          <TabsContent
            key={id}
            value={id}
            className="overflow-x-auto overscroll-x-contain rounded-b-[9px] data-ending-style:hidden pt-[11.3px] pr-[1.5px] pb-[13.8px] font-medium font-mono text-[9px] leading-[2.186em] [scrollbar-color:#2a2b2d_transparent] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-solid focus-visible:-outline-offset-2 pointer-coarse:text-[11px]"
          >
            <div className="flex w-max min-w-full">
              <div
                aria-hidden
                className="sticky left-0 w-[39.2px] shrink-0 select-none bg-code pl-[13.3px] text-ink-faint"
              >
                {lines.map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are positions.
                  <div key={i}>
                    <span className={NUMBER_BOX}>{i + 1}</span>
                  </div>
                ))}
              </div>
              <pre>
                <code>
                  {lines.map(({ indent, tokens }, i) => {
                    const kind = lineKind(tokens);
                    return (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static lines never reorder.
                      <Fragment key={i}>
                        {i > 0 ? "\n" : null}
                        {/* The mockup indents continuation lines a quarter
                            cell past the space grid. */}
                        {indent > 0 ? (
                          <span className="pl-[0.25em]">
                            {" ".repeat(indent)}
                          </span>
                        ) : null}
                        <span className={cn(LINE_BOX, tokenColor[kind])}>
                          {tokens.map(([tokenKind, text], j) =>
                            tokenKind === kind ? (
                              text
                            ) : (
                              // biome-ignore lint/suspicious/noArrayIndexKey: static tokens never reorder.
                              <span key={j} className={tokenColor[tokenKind]}>
                                {text}
                              </span>
                            ),
                          )}
                        </span>
                      </Fragment>
                    );
                  })}
                </code>
              </pre>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
