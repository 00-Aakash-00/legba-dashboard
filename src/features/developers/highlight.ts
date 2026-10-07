/*
 * A small, lossless highlighter for the developer pages' static samples
 * (shell, JavaScript, Python and JSON). No runtime dependency, like the
 * overview's code panel (no Shiki, docs/design/decisions.md): the samples are
 * known, so a few patterns cover them. Joining a line's tokens gives the line
 * back exactly, so what is shown is what gets copied.
 */

export type TokenKind =
  | "plain"
  | "command"
  | "key"
  | "string"
  | "url"
  | "placeholder"
  | "continuation";

export type Token = readonly [kind: TokenKind, text: string];

type Lexer = (text: string) => Token[];

/** Matches of `pattern` go through `inside`; the text between them through `outside`. */
function split(pattern: RegExp, inside: Lexer, outside: Lexer): Lexer {
  return (text) => {
    const tokens: Token[] = [];
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      if (match.index > last) {
        tokens.push(...outside(text.slice(last, match.index)));
      }
      tokens.push(...inside(match[0]));
      last = match.index + match[0].length;
    }
    if (last < text.length) tokens.push(...outside(text.slice(last)));
    return tokens;
  };
}

function as(kind: TokenKind): Lexer {
  return (text) => [[kind, text]];
}

/** Values the reader replaces: `{your-api-host}`, `{org_uuid}`, `YOUR_API_KEY`. */
const PLACEHOLDER = /\{[a-z_-]+\}|\bYOUR_[A-Z_]+\b/g;
const ADDRESS = /https?:\/\/[^\s'"]+/g;
/** A quoted string followed by a colon: an object key. */
const KEY = /(["'])[^"'\n]*\1(?=\s*:)/g;
/** A quoted string. One left open runs to the end of its line (a multi-line body). */
const STRING = /'[^']*'?|"[^"]*"?/g;
/** A shell command opening the line, a keyword, or a called name. */
const COMMAND =
  /^\s*(?:curl|claude|npx)\b|\b(?:const|await|import)\b|\b[A-Za-z_]\w*(?=\()/g;
const CONTINUATION = /\\$/g;

function placeholders(kind: TokenKind) {
  return split(PLACEHOLDER, as("placeholder"), as(kind));
}

function urls(kind: TokenKind) {
  return split(ADDRESS, placeholders("url"), placeholders(kind));
}

const line = split(
  KEY,
  as("key"),
  split(
    STRING,
    urls("string"),
    split(
      COMMAND,
      as("command"),
      split(CONTINUATION, as("continuation"), urls("plain")),
    ),
  ),
);

/** One token list per line of `code`. */
export function highlight(code: string): Token[][] {
  return code.split("\n").map(line);
}
