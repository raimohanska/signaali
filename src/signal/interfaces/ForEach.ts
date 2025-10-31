import { Observer, Unsubscribe } from "./Observer";

export interface ForEach<T> {
  forEach: ForEachFn<T>;
}

export type ForEachFn<t> = (observer: Observer<t>) => Unsubscribe;
