import { test } from "node:test";
import assert from "node:assert";
// @ts-expect-error - specific to node runner
import { cn, formatPrice, generateOrderNumber } from "./utils.ts";

test("cn merges classes correctly", () => {
  const result = cn("text-red-500", "text-blue-500");
  assert.strictEqual(result, "text-blue-500");
});

test("cn handles conditional classes", () => {
  const result = cn("text-red-500", false && "text-blue-500", "bg-white");
  assert.strictEqual(result, "text-red-500 bg-white");
});

test("formatPrice formats correctly for lt-LT locale", () => {
  const price = 1234.56;
  const formatted = formatPrice(price);
  // lt-LT format: "1 234,56 €" or similar, with non-breaking spaces potentially
  // We check if it contains the number parts and currency symbol
  assert.ok(formatted.includes("1"));
  assert.ok(formatted.includes("234,56"));
  assert.ok(formatted.includes("€"));
});

test("generateOrderNumber generates correct format", () => {
  const orderNumber = generateOrderNumber();
  assert.ok(orderNumber.startsWith("SIE"));
  // SIE + YY + MM + RRRR = 3 + 2 + 2 + 4 = 11 chars
  assert.strictEqual(orderNumber.length, 11);
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  assert.ok(orderNumber.includes(year));
  assert.ok(orderNumber.includes(month));
});
