import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";

export function filterSignal<T>(
  s: SignalLike<T>,
  predicate: (value: T) => boolean
): Signal<T> {
  const current = s.get();
  if (!predicate(current)) {
    throw new Error(
      "Invariant violation: initial value does not satisfy the predicate"
    );
  }

  return createSignal<T>({
    get() {
      const v = s.get();
      return predicate(v) ? v : current;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(() => {
        const v = s.get();
        if (predicate(v)) {
          observer();
        }
      });
    },
  });
}

