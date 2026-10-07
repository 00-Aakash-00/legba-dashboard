import { describe, expect, it } from "vitest";
import { formatAmount, MAX_CENTS, MIN_CENTS, parseAmount } from "./amount";

describe("parseAmount", () => {
  it.each([
    ["25", 2500],
    ["$25", 2500],
    ["25.00", 2500],
    [" $ 25.5 ", 2550],
    ["25.", 2500],
    ["1,000", 100_000],
    ["$1,250.75", 125_075],
    ["25 USD", 2500],
    ["25usd", 2500],
    ["25$", 2500],
    ["5", MIN_CENTS],
    ["10000", MAX_CENTS],
  ])("reads %j as %i cents", (input, cents) => {
    expect(parseAmount(input)).toEqual({ ok: true, cents });
  });

  it.each(["", "abc", "25.555", "-25", "2 5", "$", "1e3"])(
    "rejects %j as unreadable",
    (input) => {
      expect(parseAmount(input)).toEqual({ ok: false, reason: "format" });
    },
  );

  it.each(["4.99", "0", "10000.01", "25000"])(
    "rejects %j as out of range",
    (input) => {
      expect(parseAmount(input)).toEqual({ ok: false, reason: "range" });
    },
  );
});

describe("formatAmount", () => {
  it("drops cents for whole dollars and keeps them otherwise", () => {
    expect(formatAmount(2500)).toBe("$25");
    expect(formatAmount(2550)).toBe("$25.50");
    expect(formatAmount(125_075)).toBe("$1,250.75");
  });
});
