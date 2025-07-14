import { Computed } from "./Computed.js";
import { Effect } from "./Effect.js";
import { Signal } from "./Signal.js";

const count = new Signal(0);
const name = new Signal("John");
const secondName = new Signal({ first: "Jane", last: "Doe" });
const cartTotal = new Computed({
  deps: { count, name, secondName },
  computationFn: ({ count, name, secondName }) => {
    const val = count + name + secondName.first;
    return val;
  },
});

const logEffect = new Effect({
  deps: { cartTotal, name },
  effectFn: ({ cartTotal, name }) => {
    console.log("test", cartTotal, name);
  },
});

count.setState((prev) => prev + 1);
