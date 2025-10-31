import type { Signal } from "../interfaces/Signal";

export function isSignal(obj: any): obj is Signal<any> {
  return (
    obj && typeof obj.get === "function" && typeof obj.subscribe === "function"
  );
}

