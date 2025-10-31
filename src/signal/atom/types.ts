import { SignalLike, Signal } from "../interfaces/Signal";
import { Lens } from "../lens/lens";

export interface AtomLike<T> extends SignalLike<T> {
  set(value: T): void;
}

export interface Atom<T> extends Signal<T> {
  set(value: T): void;
  modify(modifier: (current: T) => T): void;
  view<B>(lens: Lens<T, B>): Atom<B>;
  view<K extends keyof T>(key: K): Atom<T[K]>;
  filter<B extends T>(predicate: (value: T) => value is B): Atom<B>;
  filter(predicate: (value: T) => boolean): Atom<T>;
}

