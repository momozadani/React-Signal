import { Signal } from "./Signal.js";

// Type helper to extract values from dependency object
type ExtractDependencyValues<
  T extends Record<string, Signal<any> | Computed<any, any>>
> = {
  [K in keyof T]: T[K] extends Signal<infer U>
    ? U
    : T[K] extends Computed<infer U, any>
    ? U
    : never;
};

export interface ComputedOptions<
  T,
  TDeps extends Record<string, Signal<any> | Computed<any, any>>
> {
  deps: TDeps;
  computationFn: (values: ExtractDependencyValues<TDeps>) => T;
}

export class Computed<
  T,
  TDeps extends Record<string, Signal<any> | Computed<any, any>>
> {
  private _state: T;
  private _listeners = new Set<() => void>();
  private _options: ComputedOptions<T, TDeps>;
  private _subscriptions: (() => void)[] = [];
  private _lastSeenDepValues: Record<string, unknown> = {};

  constructor(options: ComputedOptions<T, TDeps>) {
    this._options = options;
    this._state = this._computeValue();
    this._subscribeToDependencies();
  }

  get state(): T {
    return this._state;
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _computeValue(): T {
    const currentValues: Record<string, any> = {};

    for (const [key, dep] of Object.entries(this._options.deps)) {
      currentValues[key] = dep.state;
    }

    this._lastSeenDepValues = { ...currentValues };
    return this._options.computationFn(
      currentValues as ExtractDependencyValues<TDeps>
    );
  }

  private _subscribeToDependencies(): void {
    for (const [key, dep] of Object.entries(this._options.deps)) {
      const unsubscribe = dep.subscribe(() => {
        this._checkAndRecompute();
      });
      this._subscriptions.push(unsubscribe);
    }
  }

  private _checkAndRecompute(): void {
    const currentValues: Record<string, any> = {};
    let hasChanged = false;

    for (const [key, dep] of Object.entries(this._options.deps)) {
      currentValues[key] = dep.state;
      if (currentValues[key] !== this._lastSeenDepValues[key]) {
        hasChanged = true;
      }
    }

    if (hasChanged) {
      this._state = this._computeValue();
      this._flush();
    }
  }

  private _flush(): void {
    this._listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error("Computed listener error:", error);
      }
    });
  }

  dispose(): void {
    this._subscriptions.forEach((unsubscribe) => unsubscribe());
    this._subscriptions = [];
    this._listeners.clear();
  }
}
