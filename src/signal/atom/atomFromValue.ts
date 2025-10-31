import { createSignal } from "../signal/createSignal";
import { Signal } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";
import { Dispatcher } from "../internals/dispatcher";
import { createAtom } from "./createAtom";
import type { AtomLike, Atom as Atom } from "../interfaces/Atom";

export function atomFromValue<T>(initial: T): Atom<T> {
  let current = initial;
  let signal: Signal<T> = createSignal<T>({
    get() {
      return current;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      dispatcher.add(observer);
      return () => {
        dispatcher.remove(observer);
      };
    },
  });
  const dispatcher = Dispatcher<void>();

  const atomLike: AtomLike<T> = {
    ...signal,
    set(value: T) {
      if (value !== current) {
        current = value;
        dispatcher.dispatch();
      }
    },
  };
  return createAtom(atomLike);
}

