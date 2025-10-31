import { atomFromValue } from "../atom/atomFromValue";
import type { Signal } from "../interfaces/Signal";

export type PromiseState<T> =
  | { state: "pending" }
  | { state: "resolved"; value: T }
  | { state: "rejected"; error: any };

export function signalFromPromise<T>(
  promise: Promise<T>
): Signal<PromiseState<T>> {
  const state = atomFromValue<PromiseState<T>>({ state: "pending" });
  promise
    .then((value) => {
      state.set({ state: "resolved", value });
    })
    .catch((error) => {
      state.set({ state: "rejected", error });
    });
  return state;
}

