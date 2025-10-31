import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";

export function mapSignal<T, B>(
  s: SignalLike<T>,
  f: (value: T) => B
): Signal<B> {
  return createSignal<B>({
    get() {
      return f(s.get());
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(observer);
    },
  });
}

