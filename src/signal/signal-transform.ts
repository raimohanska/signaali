import { createSignal } from "./signal-constructors";
import type { Signal, SignalLike } from "./signal";
import { Observer, Unsubscribe } from "./observer";
import { Lens } from "./lens";
import { Dispatcher } from "./dispatcher";

export function cachedSignal<T>(s: SignalLike<T>): Signal<T> {
  let currentValue = s.get();
  return createSignal<T>({
    get() {
      return currentValue as T;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(() => {
        const newValue = s.get();
        if (newValue !== currentValue) {
          currentValue = newValue;
          observer();
        }
      });
    },
  });
}

export function cachedSignalWithDispatcher<T>(s: SignalLike<T>): Signal<T> {
  const dispatcher = Dispatcher<void>();
  let currentValue = s.get();
  let unsubscribe: Unsubscribe | null = null;
  return createSignal<T>({
    get() {
      return currentValue as T;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      dispatcher.add(observer);
      if (dispatcher.count() === 1) {
        unsubscribe = s.subscribe(() => {
          const newValue = s.get();
          if (newValue !== currentValue) {
            currentValue = newValue;
            dispatcher.dispatch();
          }
        });
      }
      return () => {
        dispatcher.remove(observer);
        if (dispatcher.count() === 0) {
          unsubscribe?.();
        }
      };
    },
  });
}

export function viewSignal<A, B>(
  s: SignalLike<A>,
  lens: Lens<A, B>
): Signal<B> {
  return createSignal<B>({
    get() {
      return lens.get(s.get());
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(observer);
    },
  });
}

export function filterSignal<T>(
  s: SignalLike<T>,
  predicate: (value: T) => boolean
): Signal<T> {
  const current = s.get();
  if (!predicate(current)) {
    throw new Error(
      "Invariant violation: initial value does not satisfy the predicate"
    );
  }

  return createSignal<T>({
    get() {
      const v = s.get();
      return predicate(v) ? v : current;
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(() => {
        const v = s.get();
        if (predicate(v)) {
          observer();
        }
      });
    },
  });
}

export function mapSignal<T, B>(
  s: SignalLike<T>,
  f: (value: T) => B
): Signal<B> {
  return createSignal<B>({
    get() {
      return f(s.get());
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      return s.subscribe(observer);
    },
  });
}

function debounceFn(fn: () => void, delayMs: number): () => void {
  let timeout: any = null;
  return () => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn();
    }, delayMs);
  };
}

export function debounceSignal<T>(
  s: SignalLike<T>,
  delayMs: number
): Signal<T> {
  return cachedSignalWithDispatcher({
    get() {
      return s.get();
    },
    subscribe(observer: Observer<void>): Unsubscribe {
      const debounced = debounceFn(observer, delayMs);
      return s.subscribe(debounced);
    },
  });
}

export function switchSignal<A, B>(
  input: SignalLike<A>,
  f: (value: A) => Signal<B>
): Signal<B> {
  let currentInner: Signal<B> = f(input.get());
  let unsubscribeInner: Unsubscribe | null = null;
  return cachedSignalWithDispatcher({
    get() {
      return currentInner.get();
    },
    subscribe(observer: Observer<void>) {
      const unsubscribeOuter = input.subscribe(() => {
        const newInner = f(input.get());
        if (newInner !== currentInner) {
          unsubscribeInner?.();
          currentInner = newInner;
          unsubscribeInner = currentInner.subscribe(observer);
          observer();
        }
      });
      return () => {
        unsubscribeInner?.();
        unsubscribeOuter();
      };
    },
  });
}
export function combineSignals<A, B, C>(
  signals: [SignalLike<A>, SignalLike<B>],
  f: (a: A, b: B) => C
): Signal<C>;
export function combineSignals<A, B>(
  signals: SignalLike<A>[],
  f: (...args: A[]) => B
): Signal<B>;
export function combineSignals<A, B>(
  signals: SignalLike<A>[],
  f: (...args: A[]) => B
): Signal<B> {
  return createSignal<B>({
    get() {
      return f(...signals.map((s) => s.get()));
    },
    subscribe(observer) {
      const unsubscribes = signals.map((s) => s.subscribe(observer));
      return () => unsubscribes.forEach((u) => u());
    },
  });
}
