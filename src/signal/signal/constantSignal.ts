import { createSignal } from "./createSignal";
import type { Signal } from "../interfaces/Signal";
import { Unsubscribe } from "../interfaces/Observer";

export function constantSignal<T>(value: T): Signal<T> {
  return createSignal<T>({
    get() {
      return value;
    },
    subscribe(): Unsubscribe {
      return () => {};
    },
  });
}

