import { Computed } from "./Computed.js"
import { Effect } from "./Effect.js"
import { Signal } from "./Signal.js"

const count = new Signal(0)
const name = new Signal('John')
const cartTotal = new Computed({
  deps: [count,name],
  computationFn: (items,second) => { 
    console.log("items",items, second) 
    return 10
  }
})


const logEffect = new Effect({
  deps: [cartTotal],
  effectFn: (some) => {
    console.log("some", some)
  }
})

count.setState(prev => prev + 1)