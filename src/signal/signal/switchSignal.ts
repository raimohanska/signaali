import { cachedSignalWithDispatcher } from "./cachedSignalWithDispatcher";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";

export function switchSignal<A, B>(
  input: SignalLike<A>,
  f: (value: A) => Signal<B>
): Signal<B> {
  let currentInner: Signal<B> = f(input.get());
  let unsubscribeInner: Unsubscribe | null = null;
  return cachedSignalWithDispatcher({
    get() {
      return currentInner.get();
    },
    subscribe(observer: Observer<void>) {
      const unsubscribeOuter = input.subscribe(() => {
        const newInner = f(input.get());
        if (newInner !== currentInner) {
          unsubscribeInner?.();
          currentInner = newInner;
          unsubscribeInner = currentInner.subscribe(observer);
          observer();
        }
      });
      return () => {
        unsubscribeInner?.();
        unsubscribeOuter();
      };
    },
  });
}

