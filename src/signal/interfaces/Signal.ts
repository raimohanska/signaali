import { Observer, Unsubscribe } from "./Observer";
import { Lens } from "../lens/lens";
import { ForEach } from "./ForEach";

/**
 *  Minimal Signal interface. Use createSignal to create a full Signal.
 */
export interface SignalLike<T> {
  get(): T;
  subscribe(observer: Observer<void>): Unsubscribe;
}

export interface Signal<T> extends SignalLike<T>, ForEach<T> {
  map<B>(f: (value: T) => B): Signal<B>;
  view<B>(lens: Lens<T, B>): Signal<B>;
  view<K extends keyof T>(key: K): Signal<T[K]>;
  filter<B extends T>(predicate: (value: T) => value is B): Signal<B>;
  filter(predicate: (value: T) => boolean): Signal<T>;
  debounce(delayMs: number): Signal<T>;
  log(message: string): Signal<T>;
  onChange(observer: Observer<T>): Unsubscribe;
}
