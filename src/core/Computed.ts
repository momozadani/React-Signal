import { Signal } from "./Signal.js"

export interface ComputedOptions<T> {
  deps: (Signal<any> | Computed<any>)[]
  computationFn: (...values: any[]) => T
}

export class Computed<T> {
  private _state: T
  private _listeners = new Set<() => void>()
  private _options: ComputedOptions<T>
  private _subscriptions: (() => void)[] = []
  private _lastSeenDepValues: Array<unknown> = []

  constructor(options: ComputedOptions<T>) {
    this._options = options
    
    this._state = this._computeValue()
    
    this._subscribeToDependencies()
  }

  get state(): T {
    return this._state
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  private _computeValue(): T {
    const currentValues = this._options.deps.map(dep => dep.state)
    this._lastSeenDepValues = [...currentValues]
    return this._options.computationFn(...currentValues)
  }

  private _subscribeToDependencies(): void {
    this._options.deps.forEach(dep => {
      const unsubscribe = dep.subscribe(() => {
        this._checkAndRecompute()
      })
      this._subscriptions.push(unsubscribe)
    })
  }

  private _checkAndRecompute(): void {
    const currentValues = this._options.deps.map(dep => dep.state)
    
    let hasChanged = false
    for (let i = 0; i < currentValues.length; i++) {
      if (currentValues[i] !== this._lastSeenDepValues[i]) {
        hasChanged = true
        break
      }
    }

    if (hasChanged) {
      this._state = this._computeValue()
      this._flush()
    }
  }

  private _flush(): void {
    this._listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('Computed listener error:', error)
      }
    })
  }

  dispose(): void {
    this._subscriptions.forEach(unsubscribe => unsubscribe())
    this._subscriptions = []
    this._listeners.clear()
  }
}