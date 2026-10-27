const calculateTotal = require("./utils/calculateTotal");

describe("calculateTotal", () => {
    test("calculates the total price correctly", () => {
        expect(calculateTotal(100, 3)).toBe(300);
    });

    test("returns zero when quantity is zero", () => {
        expect(calculateTotal(100, 0)).toBe(0);
    });

    test("rejects negative prices", () => {
        expect(() => calculateTotal(-100, 2)).toThrow();
    });

    test("rejects negative quantities", () => {
        expect(() => calculateTotal(100, -2)).toThrow();
    });
});