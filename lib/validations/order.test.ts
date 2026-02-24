import { describe, it } from "node:test";
import assert from "node:assert";
// @ts-expect-error TS2691: An import path cannot end with a '.ts' extension.
import { orderFormSchema } from "./order.ts";

describe("orderFormSchema", () => {
  const validData = {
    name: "Jonas Jonaitis",
    email: "jonas@example.com",
    size: "M",
    quantity: 1,
    comments: "No comments",
    printAreas: ["front"],
    phone: "+37060000000",
  };

  it("should validate correct data", () => {
    const result = orderFormSchema.safeParse(validData);
    assert.strictEqual(result.success, true);
  });

  describe("name validation", () => {
    it("should fail if name is too short", () => {
      const result = orderFormSchema.safeParse({ ...validData, name: "J" });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message === "Vardas turi būti bent 2 simbolių ilgio",
          ),
        );
      }
    });

    it("should fail if name is too long", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        name: "a".repeat(51),
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message === "Vardas negali būti ilgesnis nei 50 simbolių",
          ),
        );
      }
    });

    it("should fail if name contains invalid characters", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        name: "Jonas123",
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message === "Vardas gali turėti tik raides ir tarpus",
          ),
        );
      }
    });
  });

  describe("email validation", () => {
    it("should fail if email is invalid", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        email: "not-an-email",
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) => issue.message === "Neteisingas el. pašto formatas",
          ),
        );
      }
    });

    it("should fail if email is too short", () => {
      const result = orderFormSchema.safeParse({ ...validData, email: "a@b" });
      assert.strictEqual(result.success, false);
    });

    it("should fail if email is too long", () => {
      const longEmail = "a".repeat(101) + "@example.com";
      const result = orderFormSchema.safeParse({
        ...validData,
        email: longEmail,
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message ===
                "El. paštas negali būti ilgesnis nei 100 simbolių" ||
              issue.message === "Neteisingas el. pašto formatas",
          ),
        );
      }
    });
  });

  describe("size validation", () => {
    it("should fail if size is invalid", () => {
      // @ts-expect-error Testing invalid enum value
      const result = orderFormSchema.safeParse({
        ...validData,
        size: "INVALID",
      });
      assert.strictEqual(result.success, false);
    });

    it("should validate 3XL and 4XL", () => {
      const result3XL = orderFormSchema.safeParse({
        ...validData,
        size: "3XL",
      });
      assert.strictEqual(result3XL.success, true);
      const result4XL = orderFormSchema.safeParse({
        ...validData,
        size: "4XL",
      });
      assert.strictEqual(result4XL.success, true);
    });
  });

  describe("quantity validation", () => {
    it("should fail if quantity is less than 1", () => {
      const result = orderFormSchema.safeParse({ ...validData, quantity: 0 });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) => issue.message === "Minimalus kiekis yra 1",
          ),
        );
      }
    });

    it("should fail if quantity is greater than 1000", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        quantity: 1001,
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) => issue.message === "Maksimalus kiekis yra 1000",
          ),
        );
      }
    });

    it("should fail if quantity is not an integer", () => {
      const result = orderFormSchema.safeParse({ ...validData, quantity: 1.5 });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) => issue.message === "Kiekis turi būti sveikasis skaičius",
          ),
        );
      }
    });
  });

  describe("comments validation", () => {
    it("should allow empty comments (optional)", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        comments: undefined,
      });
      assert.strictEqual(result.success, true);

      const result2 = orderFormSchema.safeParse({ ...validData, comments: "" });
      assert.strictEqual(result2.success, true);
      if (result2.success) {
        assert.strictEqual(result2.data.comments, undefined);
      }
    });

    it("should fail if comments are too long", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        comments: "a".repeat(501),
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message ===
              "Komentaras negali būti ilgesnis nei 500 simbolių",
          ),
        );
      }
    });
  });

  describe("printAreas validation", () => {
    it("should fail if printAreas is empty", () => {
      const result = orderFormSchema.safeParse({
        ...validData,
        printAreas: [],
      });
      assert.strictEqual(result.success, false);
      if (!result.success) {
        assert.ok(
          result.error.issues.some(
            (issue) =>
              issue.message === "Pasirinkite bent vieną spausdinimo vietą",
          ),
        );
      }
    });
  });
});
