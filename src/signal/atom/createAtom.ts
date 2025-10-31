import { createSignal } from "../signal/createSignal";
import { keyOrLens2Lens } from "../lens/lens";
import type { AtomLike, Atom } from "../interfaces/Atom";

export function createAtom<T>(atom: AtomLike<T>): Atom<T> {
  const signal = createSignal<T>(atom);
  return {
    ...atom,
    ...signal,
    view<B>(lensOrKey: unknown): Atom<B> {
      const lens = keyOrLens2Lens(lensOrKey);
      return createAtom<B>({
        get() {
          return lens.get(atom.get());
        },
        set(value) {
          const root = atom.get();
          const newRoot = lens.set(root, value);
          atom.set(newRoot);
        },
        subscribe(observer) {
          return atom.subscribe(observer);
        },
      });
    },
    filter<B extends T>(predicate: (value: T) => value is B): Atom<B> {
      const filteredSignal = signal.filter(predicate);
      return createAtom<B>({
        ...filteredSignal,
        set(value) {
          atom.set(value);
        },
      });
    },
    modify(modifier) {
      this.set(modifier(this.get()));
    },
  };
}

