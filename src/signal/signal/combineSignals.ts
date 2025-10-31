import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer } from "../interfaces/Observer";
/**
 * Combines multiple signals into a new signal whose value is derived
 * from the values of the input signals using a provided function.
 *
 * Overloads:
 * - combineSignals([a, b], (a, b) => output)
 * - combineSignals([a, b, c], (a, b, c) => output)
 * - combineSignals(signals[], (...args) => output)
 *
 * The resulting signal updates when any of the source signals update.
 *
 * @param signals Array of SignalLike instances to combine.
 * @param f Function that maps the array of input values into a new value.
 * @returns A derived Signal whose value is the result of applying `f` to the source signal values.
 */
export function combineSignals<A, B, C, D>(
  signals: [SignalLike<A>, SignalLike<B>, SignalLike<C>],
  f: (a: A, b: B, c: C) => D
): Signal<D>;

export function combineSignals<A, B, C>(
  signals: [SignalLike<A>, SignalLike<B>],
  f: (a: A, b: B) => C
): Signal<C>;
export function combineSignals<A, B>(
  signals: SignalLike<A>[],
  f: (...args: A[]) => B
): Signal<B>;
export function combineSignals<A, B>(
  signals: SignalLike<A>[],
  f: (...args: A[]) => B
): Signal<B> {
  return createSignal<B>({
    get() {
      return f(...signals.map((s) => s.get()));
    },
    subscribe(observer: Observer<void>) {
      const unsubscribes = signals.map((s) => s.subscribe(observer));
      return () => unsubscribes.forEach((u) => u());
    },
  });
}

