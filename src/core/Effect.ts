import { Computed } from "./Computed.js"
import { Signal } from "./Signal.js"


export interface EffectOptions<T extends readonly unknown[]> {
  deps: (Signal<any> | Computed<any>)[]
  effectFn: (...values: T) => void
  eager?: boolean
}

export class Effect {
  private _computed: Computed<void>
  private _fn: (...values: any[]) => void
  private _cleanup?: () => void

  constructor(opts: EffectOptions<any>) {
    const { eager = true, effectFn, deps } = opts
    this._fn = effectFn

    // Create a computed that triggers our effect
    this._computed = new Computed({
      deps,
      computationFn: () => {
        // Don't run the effect during initial computation
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
      // Get current values from all dependencies
      const currentValues = this._computed['_options'].deps.map(dep => dep.state)
      // Pass values to the effect function
      this._fn(...currentValues)
    } catch (error) {
      console.error('Effect error:', error)
    }
  }

  mount() {
    return () => {
      this.dispose()
    }
  }

  dispose(): void {
    this._cleanup?.()
    this._computed.dispose()
  }
}