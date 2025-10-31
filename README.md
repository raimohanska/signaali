# Signaali

A nice abstraction that's also flexible and performant state management tool.

## What's in a Signal

A `Signal` is an object that represent a piece of application state, that you can read, and to which you can subscribe to. The interface is simple. See [Signal.ts](src/signal/interfaces/Signal.ts) for full type.

```typescript
interface Signal<T> {
  get(): T
  subscribe(observer: Observer): Unsubscribe
}

type Observer = () => void
type Unsubscribe = () => void
```

Behind this simple interface you may have, for instance

- A global state store, such as [Redux](https://redux.js.org/). In fact, the Redux store is pretty much direct fit
- A more localized state store such as an [Atom](src/signal/interfaces/Atom.ts)
- An external state store such as a [Y.js](https://github.com/yjs/yjs) document

In React, you can use the value of a signal using a [`useSignal`](src/react//useSignal.ts) hook.

The signal has a `map` function that allows you to select a part of the state similarly to Redux selectors.

## Why isn't Redux enough

Redux is great!

Yet, some of my applications tend to have state somewhere else, such as Y.js documents, and it doesn't make sense to replicate all of that into the Redux store.

Also, the single-store architecture leads to essentially all of your *selectors* to be evaluated when anything changes. When using an Y.js document for state, I can indeed subscribe to only the necessary updates and I don't want to throw performance away. With Signal composition (later) my selectors are evaluated only if any of the actual underlying stores is updated.

## Composing state with hooks

Given that I have application state in different stores anyway, I often write components that rely on more than one. In this case I can of course just use the proper hooks to get the data I need and compose that in my component like

```typescript
  const userDetails: UserDetails[] = useUserDetailsHook()
  const selectedUserId: number = useSelectedUserId()
  const selectedUserDetails: UserDetails = userDetails.find(u => u.id === selectedUserId)
```

Works nicely. Yet, your component will render every time when either hook triggers a change. To optimize this, I may of course use React [memo](https://react.dev/reference/react/memo) (not to be confused with [useMemo](https://react.dev/reference/react/useMemo)). This though only works for components, so I would need to introduce a component just to avoid unnecessary rendering.

## Signal composition

The [Signal](src/signal/interfaces/Signal.ts) is a nice abstraction in the way that it's trivial to write a helper to [`combine`](src/signal/signal/combineSignals.ts) two or more Signals into a new one, or just `map()` the value of a Signal to something that you actually need in you UI. In the case of two pieces of state, you might change your code into

```typescript
  const userDetailsSignal: Signal<UserDetails[]> = getUserDetailsSignal()
  const selectedUserIdSignal: Signal[number] = getSelectedUserIdSignal()
  const selectedUserDetails = useSignal(combineSignals(userDetailsSignal, selectedUserIdSignal, 
    (userDetails, selectedUserId) => userDetails.find(u => u.id === selectedUserId)))
```

You first combine the signals with a "selector" that yields only the required data, and "collapse" the signal using the [`useSignal`](src/react//useSignal.ts) hook. The result is that your component only renders when the end result changes. Notice that `useSignal` uses deep equality to detect if something actually changes, which means that for instance two arrays with similar contents are considered equal.

## Atoms

For mutable state, you can of course use plain old React `useState` hook, but with that there's always the issue that wherever you apply it, that component will always render when this state changes. If the state is shared between a hierarchy of components, the `useState` call needs to be at the top of that hierarchy, causing the whole hierachy to be rendered when state changes. Once again you can start appling `useMemo` and `memo` but there's another way.

Atoms.

Atom essentially gives you a way to declare state without you needing to render everything when state changes. And that's because an Atom is also a Signal, meaning that you can use pieces of state where they are actually needed. Essentially the interface for [`Atom`](src/signal/interfaces/Atom.ts) is

```typescript
interface Atom<T> extends Signal<T> {
  set(newValue: T): void
}
```

The implementation is simple. You can think of an Atom as a local/flexible Redux store that you can combine with other state stores just like any Signals.

In your React appliaction you can create an atom like

```typescript
const atom: Atom<number> = useAtom(0);
```

Then use its value where you need it (not necessarily in the root component):

```typescript
const [count, setCount] = useAtomState(atom);
```

Because Atom is also a Signal, you can also select a slice using `.map`, combine it with other state using `combineSignals` and so on.

## Example code

There's currently just one simple [example](./examples/first/index.tsx) available. 

You can run it by cloning the repo and then

```
npm install
npm run example first
```

Hopefully I get to make more.