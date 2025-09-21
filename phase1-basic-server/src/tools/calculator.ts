import { Tool } from "@modelcontextprotocol/sdk/types.js";

/**
 * Calculator tool for basic arithmetic operations
 * Supports: addition, subtraction, multiplication, division
 */
export const calculatorTool: Tool = {
  name: "calculator",
  description: "Perform basic arithmetic operations: add, subtract, multiply, divide",
  inputSchema: {
    type: "object",
    properties: {
      operation: {
        type: "string",
        enum: ["add", "subtract", "multiply", "divide"],
        description: "The arithmetic operation to perform"
      },
      a: {
        type: "number",
        description: "First number"
      },
      b: {
        type: "number",
        description: "Second number"
      }
    },
    required: ["operation", "a", "b"]
  }
};

/**
 * Execute the calculator tool
 */
export function executeCalculator(args: {
  operation: "add" | "subtract" | "multiply" | "divide";
  a: number;
  b: number;
}): number {
  const { operation, a, b } = args;

  switch (operation) {
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      if (b === 0) {
        throw new Error("Division by zero is not allowed");
      }
      return a / b;
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}