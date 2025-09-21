import { executeCalculator } from "./calculator";

describe("Calculator Tool", () => {
  test("addition works correctly", () => {
    expect(executeCalculator({ operation: "add", a: 5, b: 3 })).toBe(8);
    expect(executeCalculator({ operation: "add", a: -1, b: 1 })).toBe(0);
    expect(executeCalculator({ operation: "add", a: 0, b: 0 })).toBe(0);
  });

  test("subtraction works correctly", () => {
    expect(executeCalculator({ operation: "subtract", a: 10, b: 4 })).toBe(6);
    expect(executeCalculator({ operation: "subtract", a: 5, b: 10 })).toBe(-5);
    expect(executeCalculator({ operation: "subtract", a: 0, b: 0 })).toBe(0);
  });

  test("multiplication works correctly", () => {
    expect(executeCalculator({ operation: "multiply", a: 6, b: 7 })).toBe(42);
    expect(executeCalculator({ operation: "multiply", a: -3, b: 4 })).toBe(-12);
    expect(executeCalculator({ operation: "multiply", a: 0, b: 100 })).toBe(0);
  });

  test("division works correctly", () => {
    expect(executeCalculator({ operation: "divide", a: 15, b: 3 })).toBe(5);
    expect(executeCalculator({ operation: "divide", a: 7, b: 2 })).toBe(3.5);
    expect(executeCalculator({ operation: "divide", a: -10, b: 2 })).toBe(-5);
  });

  test("division by zero throws error", () => {
    expect(() => executeCalculator({ operation: "divide", a: 10, b: 0 })).toThrow(
      "Division by zero is not allowed"
    );
  });

  test("unknown operation throws error", () => {
    expect(() =>
      executeCalculator({ operation: "modulo" as any, a: 10, b: 3 })
    ).toThrow("Unknown operation: modulo");
  });
});