import { Observable } from "rxjs";
import { Collection, Record, Seq, ValueObject, Map } from "immutable";

export type BS = {
  [k: string]: <S extends BS>(r?: Reactive<S>) => any;
};

export type ImmutableBase =
  | Collection<any, any>
  | Collection.Indexed<any>
  | Collection.Keyed<any, any>
  | Collection.Set<any>
  | Record.Factory<any>
  | Seq<any, any>
  | Seq.Indexed<any>
  | Seq.Keyed<any, any>
  | Seq.Set<any>
  | ValueObject
  | number
  | string
  | null
  | bigint
  | boolean;

export interface IBS extends BS {
  [k: string]: <S extends BS>(r?: Reactive<S>) => ImmutableBase;
}

export type CloneFunction<T> = (input: T) => T;

export type CloneFunctionMap<S extends BS> = Partial<{
  [K in keyof S]: CloneFunction<ReturnType<S[K]>>;
}>;

export type Comparator<T> = (prev: T, next: T) => boolean;

export type ComparatorMap<S extends BS> = Partial<{
  [K in keyof S]: Comparator<ReturnType<S[K]>>;
}>;

export interface Reactive<S extends BS> {
  get: <K extends keyof S>(key: K) => ReturnType<S[K]>;

  reset: <K extends keyof S>(key: K) => void;

  resetMultiple: <KS extends Array<keyof S>>(keys: KS) => void;

  resetAll: () => void;

  set: <KS extends keyof S>(updated: { [K in KS]: ReturnType<S[K]> }) => void;

  source: () => Observable<{ [K in keyof S]: ReturnType<S[K]> }>;

  getDefault: <K extends keyof S>(key: K) => ReturnType<S[K]>;

  getMultiple: <KS extends keyof S>(
    keys: KS[]
  ) => { [K in KS]: ReturnType<S[K]> };

  getAll: () => { [K in keyof S]: ReturnType<S[K]> };

  getAllKeys: () => Array<keyof S>;

  getDefaults<KS extends keyof S>(keys: KS[]): { [k in KS]: ReturnType<S[k]> };

  getDefaultAll: () => { [k in keyof S]: ReturnType<S[k]> };
}

type Unobserve = () => void;

export type Subscribable<S extends BS> = {
  observe: <K extends keyof S>(
    key: K,
    observer: (result: ReturnType<S[K]>) => void,
    comparator?: Comparator<ReturnType<S[K]>>
  ) => Unobserve;

  observeMultiple: <KS extends keyof S>(
    keys: KS[],
    observer: (result: { [K in KS]: ReturnType<S[K]> }) => void,
    comparator?: Comparator<{ [K in KS]: ReturnType<S[K]> }>
  ) => Unobserve;

  observeAll: (
    observer: (result: { [K in keyof S]: ReturnType<S[K]> }) => void,
    comparator?: Comparator<{ [K in keyof S]: ReturnType<S[K]> }>
  ) => Unobserve;
};

export type ReactiveConfig = {
  fireOnCreate?: boolean;
  schedule?: "sync" | "async";
};

export interface Connectivity<S extends BS>
  extends Reactive<S>,
    Subscribable<S> {}

export type Action<P, T> = {
  type: T;
  payload?: P;
};

export type RequiredAction<P, T> = {
  type: T;
  payload: P;
};

export type Reducer<P, T, S extends BS, K extends keyof S> = (
  state: ReturnType<S[K]>,
  action: RequiredAction<T, P>
) => ReturnType<S[K]>;

export type AnsycReducer<P, T, S extends BS, K extends keyof S> = (
  state: ReturnType<S[K]>,
  action: Action<T, P>
) => Promise<ReturnType<S[K]>> | Observable<ReturnType<S[K]>>;

export type Dispatch<P, T> = (action: RequiredAction<P, T>) => void;

export type AsyncDispatchConfig<S extends BS, K extends keyof S> = {
  start?: () => void;
  success?: (r: ReturnType<S[K]>) => void;
  fail?: (error: unknown) => void;
  errorFallback?: () => ReturnType<S[K]>;
  always?: () => void;
};

export type AsyncDispatch<P, T, S extends BS, K extends keyof S> = (
  action: Action<P, T>,
  config?: AsyncDispatchConfig<S, K>
) => Promise<void>;

export interface Dispatcher<P, T> {
  dispatch: Dispatch<P, T>;
}

export interface AsyncDispatcher<P, T, S extends BS, K extends keyof S> {
  dispatch: AsyncDispatch<P, T, S, K>;
}

export type Computation<R, S extends BS, KS extends keyof S> = (states: {
  [K in KS]: ReturnType<S[K]>;
}) => R;

export type ComputationAsync<R, S extends BS, KS extends keyof S> = (states: {
  [K in KS]: ReturnType<S[K]>;
}) => Promise<R> | Observable<R>;

export interface Computed<R, S extends BS, KS extends keyof S> {
  readonly computation: Computation<R, S, KS>;
  get: () => R | undefined;
  observe: (observer: (r: R) => void) => Unobserve;
}

export type AsyncResponse<R> =
  | { success: true; result: R }
  | { success: false; cause: any };

export enum AsyncStates {
  FULLFILLED,
  ERROR,
  PENDING,
}

export type AsyncGet<R> = {
  state: AsyncStates;
  value?: R;
};

export interface ComputedAsync<R, S extends BS, KS extends keyof S> {
  readonly computation: ComputationAsync<R, S, KS>;
  get: () => AsyncGet<R>;
  observe: (observer: (r: AsyncResponse<R>) => void) => Unobserve;
}

export interface RxStore<S extends BS> {
  comparator: Comparator<any>;
  setState: <KS extends keyof S>(
    updated:
      | {
          [K in KS]: ReturnType<S[K]>;
        }
      | (<KS extends keyof S>(prevAll: {
          [K in KS]: ReturnType<S[K]>;
        }) => Partial<{
          [K in keyof S]: ReturnType<S[K]>;
        }>)
  ) => this;
  reset: <K extends keyof S>(key: K) => this;
  resetMultiple: <KS extends Array<keyof S>>(keys: KS) => this;
  resetAll: () => this;
  getState: <K extends keyof S>(key: K) => ReturnType<S[K]>;
  getDataSource: () => Observable<{ [K in keyof S]: ReturnType<S[K]> }>;
  createDispatch: <K extends keyof S, T, P = void>(params: {
    reducer: Reducer<T, P, S, K>;
    key: K;
  }) => Dispatch<P, T>;
  createAsyncDispatch: <K extends keyof S, T, P = void>(params: {
    reducer: AnsycReducer<T, P, S, K>;
    key: K;
  }) => AsyncDispatch<P, T, S, K>;
  withComputation: <R, KS extends keyof S>(params: {
    computation: Computation<R, S, KS>;
    keys: KS[];
  }) => Computed<R, S, KS>;
  withAsyncComputation: <R, KS extends keyof S>(params: {
    computation: ComputationAsync<R, S, KS>;
    keys: KS[];
  }) => ComputedAsync<R, S, KS>;
  getDefault<K extends keyof S>(key: K): ReturnType<S[K]>;
}

export interface RxNStore<S extends BS> extends RxStore<S> {
  getClonedState: <K extends keyof S>(key: K) => ReturnType<S[K]>;
  getImmutableState: <K extends keyof S>(
    key: K
  ) =>
    | {
        success: true;
        immutable: Collection<
          keyof ReturnType<S[K]>,
          ReturnType<S[K]>[keyof ReturnType<S[K]>]
        >;
      }
    | {
        success: false;
        immutable: ReturnType<S[K]>;
      };
  getStateAll: () => { [K in keyof S]: ReturnType<S[K]> };
  getStates: <KS extends keyof S>(
    keys: KS[]
  ) => { [K in KS]: ReturnType<S[K]> };
  getDefaults<KS extends (keyof S)[]>(
    keys: KS
  ): { [k in keyof S]: ReturnType<S[k]> };
  getDefaultAll(): { [k in keyof S]: ReturnType<S[k]> };
}

export type NRSConfig<S extends BS> = {
  cloneFunction: CloneFunction<any>;
  cloneFunctionMap: CloneFunctionMap<S>;
  comparator: Comparator<any>;
  comparatorMap: ComparatorMap<S>;
  config: ReactiveConfig;
};

export interface RxImStore<IS extends IBS> extends RxStore<IS> {
  getStateAll: () => Map<keyof IS, ReturnType<IS[keyof IS]>>;
  getStates: <KS extends keyof IS>(keys: KS[]) => Map<KS, ReturnType<IS[KS]>>;
  getDefaults<KS extends (keyof IS)[]>(
    keys: KS
  ): Map<keyof IS, ReturnType<IS[keyof IS]>>;
  getDefaultAll(): Map<keyof IS, ReturnType<IS[keyof IS]>>;
}
