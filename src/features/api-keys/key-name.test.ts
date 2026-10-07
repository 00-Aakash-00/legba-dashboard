import { describe, expect, it } from "vitest";
import { apiKeys } from "@/content/copy";
import { KEY_NAME_MAX, keyNameError } from "./key-name";
import { KeyIdSchema, KeyNameSchema } from "./schema";

describe("key name rule", () => {
  it.each([
    "",
    "   ",
    "a",
    "  Production server  ",
    "x".repeat(KEY_NAME_MAX),
    ` ${"x".repeat(KEY_NAME_MAX)} `,
    "x".repeat(KEY_NAME_MAX + 1),
    "é".repeat(KEY_NAME_MAX),
  ])("the form and the action agree on %j", (raw) => {
    const formError = keyNameError(raw);
    const parsed = KeyNameSchema.safeParse(raw);
    expect(parsed.success).toBe(formError === null);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe(formError);
    }
  });

  it("asks for a name when it is blank", () => {
    expect(keyNameError("   ")).toBe(apiKeys.dialog.nameRequired);
  });

  it("measures the trimmed name against the limit", () => {
    expect(keyNameError(` ${"x".repeat(KEY_NAME_MAX)} `)).toBeNull();
    expect(keyNameError("x".repeat(KEY_NAME_MAX + 1))).toBe(
      apiKeys.dialog.nameTooLong,
    );
  });

  it("returns the trimmed name to the action", () => {
    expect(KeyNameSchema.parse("  Staging  ")).toBe("Staging");
  });

  it("treats a missing form field as blank", () => {
    const parsed = KeyNameSchema.safeParse(null);
    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe(apiKeys.dialog.nameRequired);
  });
});

describe("key id", () => {
  it("accepts ids shaped like the store's", () => {
    expect(KeyIdSchema.safeParse("key_0123456789abcdef0123").success).toBe(
      true,
    );
  });

  it.each(["", "key_", "sub_ghost_usr_jane", "key_../../x", 42])(
    "rejects %j",
    (value) => {
      expect(KeyIdSchema.safeParse(value).success).toBe(false);
    },
  );
});
