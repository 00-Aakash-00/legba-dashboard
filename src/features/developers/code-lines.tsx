import { Fragment } from "react";
import { highlight, type Token, type TokenKind } from "./highlight";

/*
 * Token colours: the overview code panel's hues (docs/design/spec/overview.json
 * code-*), lifted to 4.5:1 on the code surface because these panels are read
 * and copied, not glanced at. Placeholders are amber, the Preview chip's
 * colour, with a dotted underline so they read as "replace me" without colour.
 */
const TOKEN: Record<TokenKind, string | null> = {
  plain: null,
  command: "text-[#b07b70]",
  key: "text-[#b07aae]",
  string: "text-[#e2495e]",
  url: "text-[#b07aae]",
  placeholder:
    "text-[#e0ae4c] underline decoration-[#e0ae4c]/45 decoration-dotted underline-offset-[3px]",
  continuation: "text-[#a8746e]",
};

function Tokens({ tokens }: { tokens: Token[] }) {
  return tokens.map(([kind, text], index) => {
    const className = TOKEN[kind];
    return className ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static tokens never reorder.
      <span key={index} className={className}>
        {text}
      </span>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: static tokens never reorder.
      <Fragment key={index}>{text}</Fragment>
    );
  });
}

/** A sentence that names placeholders, each set as it is in the code. */
export function WithPlaceholders({ text }: { text: string }) {
  return highlight(text)
    .flat()
    .map(([kind, part], index) =>
      kind === "placeholder" ? (
        // biome-ignore lint/suspicious/noArrayIndexKey: static parts never reorder.
        <code key={index} className={`text-[0.93em] ${TOKEN.placeholder}`}>
          {part}
        </code>
      ) : (
        // biome-ignore lint/suspicious/noArrayIndexKey: static parts never reorder.
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}

/** Highlighted code with no line numbers (one-line commands). */
export function Code({
  id,
  code,
  className,
}: {
  id?: string;
  code: string;
  className?: string;
}) {
  return (
    <code id={id} className={className}>
      {highlight(code).map((tokens, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static lines never reorder.
        <Fragment key={index}>
          {index > 0 ? "\n" : null}
          <Tokens tokens={tokens} />
        </Fragment>
      ))}
    </code>
  );
}

/**
 * Numbered code. The numbers stay put while long lines scroll, and they are
 * left out of selections and of what assistive tech reads.
 */
export function NumberedCode({ id, code }: { id: string; code: string }) {
  const count = code.split("\n").length;
  return (
    <div className="flex w-max min-w-full">
      <div
        aria-hidden
        className="sticky left-0 shrink-0 select-none bg-code pr-4 pl-4 text-right text-ink-faint tabular-nums"
      >
        {Array.from({ length: count }, (_, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: line numbers are positions.
          <div key={index}>{index + 1}</div>
        ))}
      </div>
      <pre className="pr-5">
        <Code id={id} code={code} />
      </pre>
    </div>
  );
}
