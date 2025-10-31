import React from "react";
import { createRoot } from "react-dom/client";
import { useAtom } from "../../src/react/useAtom";
import { useAtomState } from "../../src/react/useAtomState";
import { Atom } from "../../src/signal/atom";

interface CounterProps {
  atom: Atom<number>;
}

function App() {
  console.log("Render App");
  const atom = useAtom(0);
  return <Counter atom={atom} />;
}

function Counter({ atom }: CounterProps) {
  console.log("Render Counter");
  const [count, setCount] = useAtomState(atom);
  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Signaali Atomic Example</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

