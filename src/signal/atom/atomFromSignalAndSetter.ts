import { SignalLike } from "../interfaces/Signal";
import { createAtom } from "./createAtom";
import type { Atom } from "../interfaces/Atom";

export function atomFromSignalAndSetter<T>(
  signal: SignalLike<T>,
  setter: (value: T) => void
): Atom<T> {
  return createAtom<T>({
    ...signal,
    set(value: T) {
      setter(value);
    },
  });
}

