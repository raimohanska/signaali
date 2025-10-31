import { useSyncExternalStore } from "react";
import { Signal } from "../signal/interfaces/Signal";
import { deepEqual } from "../signal/internals/deepEqual";

const uninitialized = {}
type Uninitialized = typeof uninitialized

export function useSignal<T>(signal: Signal<T>): T {
  let value: Uninitialized | T = uninitialized;
  useSyncExternalStore((notify) => {
    return signal.subscribe(() => {      
      const newValue = signal.get();
      if (value !== uninitialized || !deepEqual(value, newValue)) {
        value = newValue
        notify()
      }      
    })
  }, () => {
    value = signal.get()
    return value
  })
  return signal.get()
}