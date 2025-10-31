import { createSignal } from "./createSignal";
import type { Signal, SignalLike } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";
import { Lens } from "../lens/lens";

export function viewSignal<A, B>(
  s: SignalLike<A>,
  lens: Lens<A, B>
): Signal<B> {
  return createSignal<B>({
    get() {
      return lens.get(s.get());
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(observer);
    },
  });
}

