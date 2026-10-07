import { describe, expect, it } from "vitest";
import { ServiceError } from "../errors";
import { registerUser, verifyCredentials } from "./auth";

describe("verifyCredentials", () => {
  it("accepts the seeded mockup account, case-insensitively", async () => {
    const user = await verifyCredentials("Jane@Demo.Gmail.com", "1234567");
    expect(user).toEqual({
      id: "usr_jane",
      name: "Jane Doe",
      email: "jane@demo.gmail.com",
    });
  });

  it("rejects a wrong password and an unknown email the same way", async () => {
    expect(await verifyCredentials("jane@demo.gmail.com", "wrong")).toBeNull();
    expect(await verifyCredentials("nobody@example.com", "1234567")).toBeNull();
  });
});

describe("registerUser", () => {
  it("creates a user who can then sign in", async () => {
    const created = await registerUser({
      name: "New Person",
      email: "New@Example.com",
      password: "Str0ng-pass",
    });
    expect(created.email).toBe("new@example.com");
    expect(await verifyCredentials("new@example.com", "Str0ng-pass")).toEqual(
      created,
    );
  });

  it("refuses an email that is already registered", async () => {
    const error = await registerUser({
      name: "Dup",
      email: "jane@demo.gmail.com",
      password: "Str0ng-pass",
    }).catch((e) => e);
    expect(error).toBeInstanceOf(ServiceError);
    expect(error.code).toBe("EMAIL_TAKEN");
  });
});
