import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";
import { Dispatcher } from "../internals/dispatcher";

export function cachedSignalWithDispatcher<T>(s: SignalLike<T>): Signal<T> {
  const dispatcher = Dispatcher<void>();
  let currentValue = s.get();
  let unsubscribe: Unsubscribe | null = null;
  return createSignal<T>({
    get() {
      return currentValue as T;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      dispatcher.add(observer);
      if (dispatcher.count() === 1) {
        unsubscribe = s.subscribe(() => {
          const newValue = s.get();
          if (newValue !== currentValue) {
            currentValue = newValue;
            dispatcher.dispatch();
          }
        });
      }
      return () => {
        dispatcher.remove(observer);
        if (dispatcher.count() === 0) {
          unsubscribe?.();
        }
      };
    },
  });
}

