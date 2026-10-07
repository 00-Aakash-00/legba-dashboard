import { describe, expect, it } from "vitest";
import { scenarioForEmail } from "./demo";

describe("scenarioForEmail", () => {
  it("maps the documented demo emails, case- and space-insensitively", () => {
    expect(scenarioForEmail(" Flaky@Demo.Legba.app ")).toBe("flaky");
    expect(scenarioForEmail("slow@demo.legba.app")).toBe("slow");
    expect(scenarioForEmail("empty@demo.legba.app")).toBe("empty");
  });

  it("treats anything else as the normal dashboard", () => {
    expect(scenarioForEmail("jane@demo.gmail.com")).toBe("normal");
    expect(scenarioForEmail("anything")).toBe("normal");
    expect(scenarioForEmail("")).toBe("normal");
    expect(scenarioForEmail(null)).toBe("normal");
  });
});
