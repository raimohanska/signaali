import { SignalLike } from "../interfaces/Signal";
import { mapSignal } from "./mapSignal";
import { filterSignal } from "./filterSignal";
import { viewSignal } from "./viewSignal";
import { cachedSignal } from "./cachedSignal";
import { debounceSignal } from "./debounceSignal";
import type { Signal } from "../interfaces/Signal";
import { Observer, Unsubscribe } from "../interfaces/Observer";
import { keyOrLens2Lens } from "../lens/lens";
import { log } from "./log";

export function createSignal<T>(s: SignalLike<T>): Signal<T> {
  return {
    get: () => s.get(),
    /**
     * Calls the observer whenever the signal might have changed.
     * Note that the value might not have actually changed, because it's not checked here.
     * Hence, this should be considered a low-level API.
     *
     * @param observer
     * @returns
     */
    subscribe: s.subscribe,
    map<B>(f: (value: T) => B): Signal<B> {
      return mapSignal(this, f);
    },
    view<B>(lensOrKey: unknown): Signal<B> {
      const lens = keyOrLens2Lens(lensOrKey);
      return viewSignal(this, lens);
    },
    filter(predicate: (value: T) => boolean): Signal<T> {
      return filterSignal(this, predicate);
    },
    debounce(delayMs) {
      return debounceSignal(this, delayMs);
    },
    log(message) {
      log(this, message);
      return this;
    },
    /**
     * Calls the observer immediately, as well as when the signal value changes, with the new value as argument.
     * Changes are currently defined based on reference equality (===).
     *
     * @param observer
     * @returns
     */
    forEach(observer: Observer<T>): Unsubscribe {
      return cachedSignal(this).subscribe(() => observer(s.get()));
    },
    /**
     * Calls the observer when the signal value changes, with the new value as argument.
     * Changes are currently defined based on reference equality (===).
     *
     * @param observer
     * @returns
     */
    onChange(observer: Observer<T>): Unsubscribe {
      return cachedSignal(this).subscribe(() => observer(this.get()));
    },
  };
}

