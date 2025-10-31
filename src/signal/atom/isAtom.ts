import { isSignal } from "../signal/isSignal";
import type { Atom } from "../interfaces/Atom";

export function isAtom<T>(obj: any): obj is Atom<T> {
  return (
    isSignal(obj) &&
    typeof (obj as any).set === "function" &&
    typeof (obj as any).modify === "function"
  );
}

