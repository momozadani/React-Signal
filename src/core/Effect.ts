import { Computed } from "./Computed.js"
import { Signal } from "./Signal.js"

export interface EffectOptions {
  deps: (Signal<any> | Computed<any>)[]
  fn: () => void
  eager?: boolean
}

export class Effect {
  private _computed: Computed<void>
  private _fn: () => void
  private _cleanup?: () => void

  constructor(opts: EffectOptions) {
    const { eager = true, fn, deps } = opts
    this._fn = fn

    this._computed = new Computed({
      deps,
      computationFn: () => {
        return undefined
      }
    })

    // Subscribe to the computed to run effects
    this._cleanup = this._computed.subscribe(() => {
      this._runEffect()
    })

    // Run immediately if eager
    if (eager) {
      this._runEffect()
    }
  }

  private _runEffect(): void {
    try {
      this._fn()
    } catch (error) {
      console.error('Effect error:', error)
    }
  }

  mount() {
    // Return dispose function
    return () => {
      this.dispose()
    }
  }

  dispose(): void {
    this._cleanup?.()
    this._computed.dispose()
  }
}