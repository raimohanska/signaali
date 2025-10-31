import { describe, it, expect, vi } from "vitest";
import { atomFromValue } from "./atomFromValue";
import { isAtom } from "./isAtom";

describe("atomFromValue", () => {
  it("should create an atom with an initial value", () => {
    const atom = atomFromValue(42);
    expect(atom.get()).toBe(42);
    expect(isAtom(atom)).toBe(true);
  });

  it("should allow setting a new value", () => {
    const atom = atomFromValue("hello");
    atom.set("world");
    expect(atom.get()).toBe("world");
  });

  it("should not dispatch if value hasn't changed", () => {
    const atom = atomFromValue(10);
    const observer = vi.fn();
    atom.subscribe(observer);

    atom.set(10); // Same value
    expect(observer).not.toHaveBeenCalled();

    atom.set(11); // Different value
    expect(observer).toHaveBeenCalledTimes(1);
  });

  it("should notify subscribers when value changes", () => {
    const atom = atomFromValue(1);
    const observer1 = vi.fn();
    const observer2 = vi.fn();

    const unsub1 = atom.subscribe(observer1);
    const unsub2 = atom.subscribe(observer2);

    atom.set(2);
    expect(observer1).toHaveBeenCalledTimes(1);
    expect(observer2).toHaveBeenCalledTimes(1);

    unsub1();
    atom.set(3);
    expect(observer1).toHaveBeenCalledTimes(1); // Still 1
    expect(observer2).toHaveBeenCalledTimes(2); // Now 2
  });

  it("should support modify", () => {
    const atom = atomFromValue(5);
    atom.modify((x) => x + 3);
    expect(atom.get()).toBe(8);
  });

  it("should support view", () => {
    const atom = atomFromValue({ x: 1, y: 2 });
    const xAtom = atom.view("x");
    xAtom.set(10);
    expect(atom.get().x).toBe(10);
    expect(atom.get().y).toBe(2);
  });

  it("should work with complex objects", () => {
    const atom = atomFromValue({ nested: { value: 1 } });
    expect(atom.get().nested.value).toBe(1);
    atom.set({ nested: { value: 2 } });
    expect(atom.get().nested.value).toBe(2);
  });
});

