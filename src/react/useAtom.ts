import { useMemo } from "react";
import { createAtom, atomFromValue, Atom } from "../signal";

export function useAtom<T>(initialValue: T): Atom<T> {
  return useMemo(() => atomFromValue<T>(initialValue), [initialValue])
}

