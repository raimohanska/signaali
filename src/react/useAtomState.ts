import { Atom } from "../signal";
import { useSignal } from "./useSignal";

export function useAtomState<T>(atom: Atom<T>): [T, (value: T) => void] {
  const value = useSignal(atom);
  return [value, atom.set];
}
