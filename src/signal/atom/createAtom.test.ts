import { describe, it, expect, vi } from "vitest";
import { SignalLike } from "../interfaces/Signal";
import { prop } from "../lens/lens";
import { AtomLike } from "../interfaces/Atom";
import { createAtom } from "./createAtom";
import { isAtom } from "./isAtom";
import { atomFromValue } from "./atomFromValue";

describe("createAtom", () => {
  it("should create an atom from an AtomLike", () => {
    let value = 42;
    const atomLike: AtomLike<number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    expect(atom.get()).toBe(42);
    expect(isAtom(atom)).toBe(true);
    expect(typeof atom.set).toBe("function");
    expect(typeof atom.modify).toBe("function");
  });

  it("should allow setting a new value", () => {
    let value = 10;
    const atomLike: AtomLike<number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    atom.set(20);
    expect(atom.get()).toBe(20);
  });

  it("should support modify method", () => {
    let value = 5;
    const atomLike: AtomLike<number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    atom.modify((x) => x * 2);
    expect(atom.get()).toBe(10);
  });

  it("should notify subscribers when value changes", () => {
    let value = 1;
    const observers: Array<() => void> = [];
    const atomLike: AtomLike<number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
        observers.forEach((obs) => obs());
      },
      subscribe(observer) {
        observers.push(observer);
        return () => {
          const index = observers.indexOf(observer);
          if (index >= 0) observers.splice(index, 1);
        };
      },
    };

    const atom = createAtom(atomLike);
    const observer = vi.fn();
    atom.subscribe(observer);

    atom.set(2);
    expect(observer).toHaveBeenCalledTimes(1);
    expect(atom.get()).toBe(2);
  });

  it("should support view with a key", () => {
    let root = { name: "Alice", age: 30 };
    const atomLike: AtomLike<{ name: string; age: number }> = {
      get() {
        return root;
      },
      set(newValue) {
        root = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    const nameAtom = atom.view("name");

    expect(nameAtom.get()).toBe("Alice");
    nameAtom.set("Bob");
    expect(atom.get().name).toBe("Bob");
    expect(atom.get().age).toBe(30);
  });

  it("should support view with a lens", () => {
    let root = { name: "Alice", age: 30 };
    const atomLike: AtomLike<{ name: string; age: number }> = {
      get() {
        return root;
      },
      set(newValue) {
        root = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    const nameLens = prop<{ name: string; age: number }, "name">("name");
    const nameAtom = atom.view(nameLens);

    expect(nameAtom.get()).toBe("Alice");
    nameAtom.set("Charlie");
    expect(atom.get().name).toBe("Charlie");
    expect(atom.get().age).toBe(30);
  });

  it("should support filter with type predicate", () => {
    let value: string | number = "hello";
    const atomLike: AtomLike<string | number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    const stringAtom = atom.filter((x): x is string => typeof x === "string");

    expect(stringAtom.get()).toBe("hello");
    atom.set("world");
    expect(stringAtom.get()).toBe("world");
  });

  it("should support filter with boolean predicate", () => {
    let value = 5;
    const atomLike: AtomLike<number> = {
      get() {
        return value;
      },
      set(newValue) {
        value = newValue;
      },
      subscribe() {
        return () => {};
      },
    };

    const atom = createAtom(atomLike);
    const filteredAtom = atom.filter((x) => x > 3);

    expect(filteredAtom.get()).toBe(5);
    atom.set(2);
    // Filter returns the last value that passed the predicate when current value fails
    expect(filteredAtom.get()).toBe(5);
    atom.set(7);
    expect(filteredAtom.get()).toBe(7); // Now 7 passes the predicate
  });

  describe("integration with signal methods", () => {
    it("should work with map", () => {
      const atom = atomFromValue(5);
      const doubled = atom.map((x) => x * 2);
      expect(doubled.get()).toBe(10);
      atom.set(6);
      expect(doubled.get()).toBe(12);
    });

    it("should work with onChange", () => {
      const atom = atomFromValue(1);
      const onChangeObserver = vi.fn();
      atom.onChange(onChangeObserver);

      expect(onChangeObserver).not.toHaveBeenCalled(); // onChange doesn't call immediately

      atom.set(2);
      expect(onChangeObserver).toHaveBeenCalledWith(2);

      atom.set(3);
      expect(onChangeObserver).toHaveBeenCalledWith(3);
      expect(onChangeObserver).toHaveBeenCalledTimes(2);
    });

    it("should work with nested view operations", () => {
      const atom = atomFromValue({ user: { profile: { name: "Alice" } } });
      const userAtom = atom.view("user");
      const profileAtom = userAtom.view("profile");
      const nameAtom = profileAtom.view("name");

      expect(nameAtom.get()).toBe("Alice");
      nameAtom.set("Bob");
      expect(atom.get().user.profile.name).toBe("Bob");
    });

    it("should support filter chaining", () => {
      const atom = atomFromValue(5);
      const filtered1 = atom.filter((x) => x > 0);
      const filtered2 = filtered1.filter((x) => x < 10);

      expect(filtered2.get()).toBe(5);
      atom.set(15);
      // Filter returns last valid value when predicate fails
      expect(filtered2.get()).toBe(5); // 15 > 10, so filter returns last valid (5)
      atom.set(7);
      expect(filtered2.get()).toBe(7); // 7 passes both predicates
    });

    it("should maintain atom type through view operations", () => {
      const atom = atomFromValue({ a: { b: { c: 1 } } });
      const aAtom = atom.view("a");
      const bAtom = aAtom.view("b");
      const cAtom = bAtom.view("c");

      expect(isAtom(cAtom)).toBe(true);
      cAtom.set(2);
      expect(atom.get().a.b.c).toBe(2);
    });

    it("should support modify on viewed atoms", () => {
      const atom = atomFromValue({ count: 0 });
      const countAtom = atom.view("count");

      countAtom.modify((x) => x + 1);
      expect(atom.get().count).toBe(1);

      countAtom.modify((x) => x * 2);
      expect(atom.get().count).toBe(2);
    });

    it("should support setting filtered atoms", () => {
      const atom = atomFromValue(5);
      const filteredAtom = atom.filter((x) => x > 3);

      // Setting through filtered atom should update the source
      filteredAtom.set(8);
      expect(atom.get()).toBe(8);
      expect(filteredAtom.get()).toBe(8);
    });

    it("should support modify on filtered atoms", () => {
      const atom = atomFromValue(10);
      const filteredAtom = atom.filter((x) => x > 5);

      filteredAtom.modify((x) => x + 5);
      expect(atom.get()).toBe(15);
      expect(filteredAtom.get()).toBe(15);
    });
  });
});

