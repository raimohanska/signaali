import { describe, it, expect, vi } from "vitest";
import { SignalLike } from "../interfaces/Signal";
import { atomFromSignalAndSetter } from "./atomFromSignalAndSetter";
import { isAtom } from "./isAtom";

describe("atomFromSignalAndSetter", () => {
  it("should create an atom from a signal and setter", () => {
    let value = 100;
    const signal: SignalLike<number> = {
      get() {
        return value;
      },
      subscribe() {
        return () => {};
      },
    };

    const setter = vi.fn((newValue: number) => {
      value = newValue;
    });

    const atom = atomFromSignalAndSetter(signal, setter);
    expect(atom.get()).toBe(100);
    expect(isAtom(atom)).toBe(true);
    expect(typeof atom.set).toBe("function");
    expect(typeof atom.modify).toBe("function");

    atom.set(200);
    expect(setter).toHaveBeenCalledWith(200);
    expect(atom.get()).toBe(200);
  });

  it("should work with different types", () => {
    let value = { id: 1, name: "test" };
    const signal: SignalLike<{ id: number; name: string }> = {
      get() {
        return value;
      },
      subscribe() {
        return () => {};
      },
    };

    const setter = vi.fn((newValue: { id: number; name: string }) => {
      value = newValue;
    });

    const atom = atomFromSignalAndSetter(signal, setter);
    const newValue = { id: 2, name: "updated" };
    atom.set(newValue);
    expect(setter).toHaveBeenCalledWith(newValue);
    expect(atom.get()).toEqual(newValue);
  });
});

