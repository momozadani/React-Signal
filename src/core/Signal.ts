export class Signal<T> {
  private _state: T
  private _listeners = new Set<() => void>()

  constructor(initialValue: T) {
    this._state = initialValue
  }

  get state(): T {
    return this._state
  }

  setState(updater: (prevState: T) => T): void {
    const prevState = this._state
    this._state = updater(prevState)

    // Only flush if state actually changed
    if (this._state !== prevState) {
      this.flush()
    }
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  private flush(): void {
    this._listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('Signal listener error:', error)
      }
    })
  }
}