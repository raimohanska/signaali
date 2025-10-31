import { describe, it, expect } from "vitest";
import { constantSignal } from "../signal/constantSignal";
import { createAtom } from "./createAtom";
import { AtomLike } from "../interfaces/Atom";
import { atomFromValue } from "./atomFromValue";
import { isAtom } from "./isAtom";

describe("isAtom", () => {
  it("should return true for atoms created with createAtom()", () => {
    const atomLike: AtomLike<number> = {
      get: () => 1,
      set: () => {},
      subscribe: () => () => {},
    };
    const atom = createAtom(atomLike);
    expect(isAtom(atom)).toBe(true);
    expect(typeof atom.set).toBe("function");
    expect(typeof atom.modify).toBe("function");
  });

  it("should return false for a plain signal", () => {
    const signal = constantSignal(1);
    expect(isAtom(signal)).toBe(false);
  });

  it("should work correctly with type guards in TypeScript", () => {
    const maybeAtom: unknown = atomFromValue(42);
    if (isAtom(maybeAtom)) {
      // TypeScript should narrow the type here
      expect(maybeAtom.get()).toBe(42);
    } else {
      throw new Error("Type guard failed");
    }
  });
});

