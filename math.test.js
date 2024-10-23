// math.test.js
const sum = (a, b) => a + b;
const multiply = (a, b) => a * b;
const divide = (a, b) => {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
};

describe("Math Functions", () => {
  describe("sum", () => {
    it("should add two numbers", () => {
      expect(sum(2, 2)).toBe(4);
    });

    it("should add negative numbers", () => {
      expect(sum(-2, -2)).toBe(-4);
    });

    it("should add decimal numbers", () => {
      expect(sum(2.5, 1.5)).toBe(4);
    });
  });

  describe("multiply", () => {
    it("should multiply two numbers", () => {
      expect(multiply(4, 5)).toBe(20);
    });

    it("should multiply negative numbers", () => {
      expect(multiply(-4, -5)).toBe(20);
    });

    it("should multiply decimal numbers", () => {
      expect(multiply(2.5, 1.5)).toBe(3.75);
    });
  });

  describe("divide", () => {
    it("should divide two numbers", () => {
      expect(divide(10, 2)).toBe(5);
    });

    it("should divide decimal numbers", () => {
      expect(divide(10.5, 2)).toBe(5.25);
    });

    it("should throw an error for division by zero", () => {
      expect(() => {
        divide(10, 0);
      }).toThrowError("Division by zero");
    });
  });
});
