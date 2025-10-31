import { useMemo } from "react";
import { Atom, atomFromValue } from "../signal";

export function useAtom<T>(initialValue: T): Atom<T> {
  return useMemo(() => atomFromValue<T>(initialValue), [initialValue])
}

