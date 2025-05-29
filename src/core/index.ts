import { Effect } from "./Effect.js"
import { Signal } from "./Signal.js"

const count = new Signal(0)
const name = new Signal('John')

const logEffect = new Effect({
  deps: [count, name],
  fn: () => {
    console.log(`Count: ${count.state}, Name: ${name.state}`)
  }
})

logEffect.mount()
count.setState(prev => prev + 1)