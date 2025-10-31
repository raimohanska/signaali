import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";
/**
 * Wraps a SignalLike to produce a Signal whose get() is always cached to the last value
 * seen from the source, and not the live value. This is especially useful if the source
 * signal is expensive to compute or to avoid recomputation/thrashing when subscribing.
 *
 * The returned Signal will only update its cached value (and notify subscribers)
 * when the underlying SignalLike value actually changes (using reference equality).
 *
 * @param s - The input SignalLike to cache.
 * @returns A Signal whose value is cached to the last-seen value from `s`.
 */

export function cachedSignal<T>(s: SignalLike<T>): Signal<T> {
  let currentValue = s.get();
  return createSignal<T>({
    get() {
      return currentValue as T;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(() => {
        const newValue = s.get();
        if (newValue !== currentValue) {
          currentValue = newValue;
          observer();
        }
      });
    },
  });
}

