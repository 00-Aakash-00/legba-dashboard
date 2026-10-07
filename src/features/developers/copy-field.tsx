"use client";

import { useId } from "react";
import { Code } from "./code-lines";
import { CopyButton, CopyFailed, selectText, useCopy } from "./copy-button";

/**
 * A one-line command in a terminal-style field with its Copy button. The
 * command wraps on narrow screens rather than hiding behind a scroll, and
 * stays selectable; the `$` prompt is left out of selections and copies.
 */
export function CopyField({ value, name }: { value: string; name: string }) {
  const codeId = useId();
  const { state, copy } = useCopy();
  return (
    <div>
      <div className="flex flex-col gap-3 rounded-[14px] border border-auth-field-line bg-field py-3 pr-3 pl-3.5 sm:flex-row sm:items-center sm:py-2.5 sm:pl-4">
        <p className="flex min-w-0 flex-1 gap-2.5 font-medium font-mono text-[#b2b1af] text-[13px] leading-6 sm:gap-3 sm:text-[14px]">
          <span aria-hidden className="select-none text-ink-faint">
            $
          </span>
          <Code
            id={codeId}
            code={value}
            className="min-w-0 text-balance break-words selection:bg-signal/35"
          />
        </p>
        <CopyButton
          state={state}
          what={name}
          onCopy={() => copy(value, () => selectText(codeId))}
          className="pointer-coarse:h-11 max-sm:h-11 max-sm:w-full"
        />
      </div>
      {state === "failed" ? <CopyFailed className="mt-2.5" /> : null}
    </div>
  );
}
