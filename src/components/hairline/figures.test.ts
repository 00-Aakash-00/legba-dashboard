import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// User rule (AGENTS.md): every hairline figure is used in exactly one place.
const SRC = join(import.meta.dirname, "../..");
const HOST = readFileSync(
  join(import.meta.dirname, "hairline-figure.tsx"),
  "utf8",
);

/** The string members of `export type <name> = "a" | "b";` in the host. */
function kindsOf(name: string) {
  const union = HOST.match(new RegExp(`export type ${name} =([^;]+);`))?.[1];
  return [...(union ?? "").matchAll(/"(\w+)"/g)].map((match) => match[1]);
}

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".test.ts")
      ? [path]
      : [];
  });
}

const ALL = [...kindsOf("InteractiveKind"), ...kindsOf("StateKind")];

/** Every place a figure is named literally: figure="x", kind="x", plan="x". */
function literalUses() {
  const uses = new Map<string, string[]>();
  for (const file of sources(SRC)) {
    const text = readFileSync(file, "utf8");
    for (const [, kind] of text.matchAll(/\b(?:figure|kind|plan)="(\w+)"/g)) {
      if (!ALL.includes(kind)) continue;
      uses.set(kind, [...(uses.get(kind) ?? []), file.slice(SRC.length + 1)]);
    }
  }
  return uses;
}

describe("hairline figures", () => {
  it("names no figure literally in more than one place", () => {
    for (const [kind, places] of literalUses()) {
      expect(places, `${kind} is used in ${places.join(", ")}`).toHaveLength(1);
    }
  });

  it("never borrows a card figure outside its plan card", () => {
    // Card figures live in the overview's subscription cards and nowhere else.
    const uses = literalUses();
    for (const kind of kindsOf("InteractiveKind")) {
      const elsewhere = (uses.get(kind) ?? []).filter(
        (place) => !place.startsWith("features/subscriptions/"),
      );
      expect(elsewhere, `${kind} is borrowed`).toHaveLength(0);
    }
  });

  it("uses every empty/error-state figure", () => {
    const uses = literalUses();
    for (const kind of kindsOf("StateKind")) {
      expect(uses.get(kind) ?? [], `${kind} is never used`).toHaveLength(1);
    }
  });
});
