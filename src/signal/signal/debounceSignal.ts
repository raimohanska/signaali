import { cachedSignalWithDispatcher } from "./cachedSignalWithDispatcher";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";

function debounceFn(fn: () => void, delayMs: number): () => void {
  let timeout: any = null;
  return () => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn();
    }, delayMs);
  };
}

export function debounceSignal<T>(
  s: SignalLike<T>,
  delayMs: number
): Signal<T> {
  return cachedSignalWithDispatcher({
    get() {
      return s.get();
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      const debounced = debounceFn(observer, delayMs);
      return s.subscribe(debounced);
    },
  });
}

