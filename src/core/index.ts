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
    return { val };
  },
});

const cartTotal2 = new Computed({
  deps: { cartTotal },
  computationFn: ({ cartTotal }) => {
    console.log("cartTotal2", cartTotal);
    return cartTotal.val + 3;
  },
});

const logEffect = new Effect({
  deps: { cartTotal, name, cartTotal2 },
  effectFn: ({ cartTotal, name, cartTotal2 }) => {
    console.log("test", cartTotal, name);
  },
});

count.setState((prev) => prev + 1);
