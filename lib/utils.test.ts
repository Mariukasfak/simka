import { describe, it } from "node:test";
import assert from "node:assert";
// @ts-expect-error
import { generateOrderNumber } from "./utils.ts";

describe("generateOrderNumber", () => {
  it("should generate an order number with correct format for double-digit month and standard random number", (t) => {
    // Mock Date: 2023-11-15 (month 11)
    t.mock.timers.enable({
      apis: ["Date"],
      now: new Date("2023-11-15T12:00:00Z").getTime(),
    });

    // Mock Math.random to return 0.5 (=> 5000)
    t.mock.method(Math, "random", () => 0.5);

    const orderNumber = generateOrderNumber();

    // SIE + 23 + 11 + 5000
    assert.strictEqual(orderNumber, "SIE23115000");
  });

  it("should generate an order number with correct format for single-digit month and small random number", (t) => {
    // Mock Date: 2024-05-01 (month 5)
    t.mock.timers.enable({
      apis: ["Date"],
      now: new Date("2024-05-01T12:00:00Z").getTime(),
    });

    // Mock Math.random to return 0.0005 (=> 5) -> padded to 0005
    t.mock.method(Math, "random", () => 0.0005);

    const orderNumber = generateOrderNumber();

    // SIE + 24 + 05 + 0005
    assert.strictEqual(orderNumber, "SIE24050005");
  });
});
