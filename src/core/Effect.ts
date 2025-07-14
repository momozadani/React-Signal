import { Computed } from "./Computed.js";
import { Signal } from "./Signal.js";

type ExtractDependencyValues<
  T extends Record<string, Signal<any> | Computed<any, any>>
> = {
  [K in keyof T]: T[K] extends Signal<infer U>
    ? U
    : T[K] extends Computed<infer U, any>
    ? U
    : never;
};

export interface EffectOptions<
  TDeps extends Record<string, Signal<any> | Computed<any, any>>
> {
  deps: TDeps;
  effectFn: (values: ExtractDependencyValues<TDeps>) => void;
  eager?: boolean;
}

export class Effect<
  TDeps extends Record<string, Signal<any> | Computed<any, any>>
> {
  private _computed: Computed<void, TDeps>;
  private _fn: (values: ExtractDependencyValues<TDeps>) => void;
  private _cleanup?: () => void;

  constructor(opts: EffectOptions<TDeps>) {
    const { eager = true, effectFn, deps } = opts;
    this._fn = effectFn;

    // Explicitly type the Computed since we know the return type is void
    this._computed = new Computed<void, TDeps>({
      deps,
      computationFn: () => {
        return undefined;
      },
    });

    this._cleanup = this._computed.subscribe(() => {
      this._runEffect();
    });

    if (eager) {
      this._runEffect();
    }
  }

  private _runEffect(): void {
    try {
      const currentValues: Record<string, any> = {};
      for (const [key, dep] of Object.entries(
        this._computed["_options"].deps
      )) {
        currentValues[key] = dep.state;
      }
      this._fn(currentValues as ExtractDependencyValues<TDeps>);
    } catch (error) {
      console.error("Effect error:", error);
    }
  }

  mount() {
    return () => {
      this.dispose();
    };
  }

  dispose(): void {
    this._cleanup?.();
    this._computed.dispose();
  }
}
