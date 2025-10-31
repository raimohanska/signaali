import { describe, it, expect, vi } from "vitest";
import { Dispatcher } from "./dispatcher";

describe("Dispatcher", () => {
  describe("basic functionality", () => {
    it("should start with zero observers", () => {
      const dispatcher = Dispatcher<number>();
      expect(dispatcher.count()).toBe(0);
    });


    it("should dispatch to all observers", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn();
      const observer2 = vi.fn();

      dispatcher.add(observer1);
      dispatcher.add(observer2);

      dispatcher.dispatch(42);
      expect(observer1).toHaveBeenCalledWith(42);
      expect(observer2).toHaveBeenCalledWith(42);
      expect(observer1).toHaveBeenCalledTimes(1);
      expect(observer2).toHaveBeenCalledTimes(1);
    });

    it("should dispatch to observers in order", () => {
      const dispatcher = Dispatcher<string>();
      const callOrder: string[] = [];

      const observer1 = () => callOrder.push("1");
      const observer2 = () => callOrder.push("2");
      const observer3 = () => callOrder.push("3");

      dispatcher.add(observer1);
      dispatcher.add(observer2);
      dispatcher.add(observer3);

      dispatcher.dispatch("test");
      expect(callOrder).toEqual(["1", "2", "3"]);
    });
  });

  describe("remove functionality", () => {
    it("should remove observers", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn();
      const observer2 = vi.fn();

      dispatcher.add(observer1);
      dispatcher.add(observer2);
      expect(dispatcher.count()).toBe(2);

      const removed = dispatcher.remove(observer1);
      expect(removed).toBe(true);
      expect(dispatcher.count()).toBe(1);

      dispatcher.dispatch(10);
      expect(observer1).not.toHaveBeenCalled();
      expect(observer2).toHaveBeenCalledWith(10);
    });

    it("should return false when removing non-existent observer", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn();
      const observer2 = vi.fn();

      dispatcher.add(observer1);
      const removed = dispatcher.remove(observer2);
      expect(removed).toBe(false);
      expect(dispatcher.count()).toBe(1);
    });

    it("should handle removing the same observer multiple times", () => {
      const dispatcher = Dispatcher<number>();
      const observer = vi.fn();

      dispatcher.add(observer);
      expect(dispatcher.remove(observer)).toBe(true);
      expect(dispatcher.remove(observer)).toBe(false);
      expect(dispatcher.count()).toBe(0);
    });

    it("should not call removed observers", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn();
      const observer2 = vi.fn();
      const observer3 = vi.fn();

      dispatcher.add(observer1);
      dispatcher.add(observer2);
      dispatcher.add(observer3);

      dispatcher.remove(observer2);
      dispatcher.dispatch(5);

      expect(observer1).toHaveBeenCalledWith(5);
      expect(observer2).not.toHaveBeenCalled();
      expect(observer3).toHaveBeenCalledWith(5);
    });
  });

  describe("nested dispatch handling", () => {
    it("should queue dispatches that occur during dispatch", () => {
      const dispatcher = Dispatcher<number>();
      const calls: number[] = [];

      const observer1 = (value: number) => {
        if (value === 1) {
          dispatcher.dispatch(2);
        }
        calls.push(value);
      };

      dispatcher.add(observer1);
      dispatcher.dispatch(1);

      expect(calls).toEqual([1, 2]);
    });
  });

  describe("removal during dispatch", () => {
    it("should skip observers removed during dispatch", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn((value: number) => {
        dispatcher.remove(observer2);
      });
      const observer2 = vi.fn();

      dispatcher.add(observer1);
      dispatcher.add(observer2);

      dispatcher.dispatch(10);

      // observer1 should be called
      expect(observer1).toHaveBeenCalledWith(10);
      // observer2 should be skipped because it was removed during dispatch
      expect(observer2).not.toHaveBeenCalled();
      expect(dispatcher.count()).toBe(1);
    });

    it("should handle removing self during dispatch", () => {
      const dispatcher = Dispatcher<number>();
      let callCount = 0;
      const observer1 = vi.fn((value: number) => {
        callCount++;
        if (callCount === 1) {
          dispatcher.remove(observer1);
        }
      });

      dispatcher.add(observer1);
      dispatcher.dispatch(1);

      // Should be called once before removal
      expect(observer1).toHaveBeenCalledTimes(1);
      expect(dispatcher.count()).toBe(0);
    });
  });


  describe("edge cases", () => {
    it("should handle adding the same observer multiple times", () => {
      const dispatcher = Dispatcher<number>();
      const observer = vi.fn();

      dispatcher.add(observer);
      dispatcher.add(observer);
      dispatcher.add(observer);

      expect(dispatcher.count()).toBe(3);
      dispatcher.dispatch(5);
      expect(observer).toHaveBeenCalledTimes(3);
    });

    it("should clear removed set after dispatch", () => {
      const dispatcher = Dispatcher<number>();
      const observer1 = vi.fn((value: number) => {
        if (value === 1) {
          dispatcher.remove(observer2);
        }
      });
      const observer2 = vi.fn();

      dispatcher.add(observer1);
      dispatcher.add(observer2);

      // First dispatch removes observer2
      dispatcher.dispatch(1);
      expect(observer2).not.toHaveBeenCalled();

      // Add observer2 back
      dispatcher.add(observer2);

      // Second dispatch should call observer2
      dispatcher.dispatch(2);
      expect(observer2).toHaveBeenCalledWith(2);
    });
  });

  describe("complex scenarios", () => {
    it("should handle complex nested dispatch with removals", () => {
      const dispatcher = Dispatcher<number>();
      const calls: number[] = [];

      const observer1 = vi.fn((value: number) => {
        calls.push(value);
        if (value === 1) {
          dispatcher.remove(observer3);
          dispatcher.dispatch(2);
        }
      });

      const observer2 = vi.fn((value: number) => {
        calls.push(value);
      });

      const observer3 = vi.fn((value: number) => {
        calls.push(value);
      });

      dispatcher.add(observer1);
      dispatcher.add(observer2);
      dispatcher.add(observer3);

      dispatcher.dispatch(1);

      // Both observer1 and observer2 are called for both dispatches (1 and 2)
      // observer3 is removed during dispatch, so it's not called
      expect(calls).toEqual([1, 1, 2, 2]);
      expect(observer3).not.toHaveBeenCalled();
    });
  });
});

