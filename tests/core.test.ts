import { describe, it, expect } from "vitest";
import { Podcraft } from "../src/core.js";
describe("Podcraft", () => {
  it("init", () => { expect(new Podcraft().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Podcraft(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Podcraft(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
