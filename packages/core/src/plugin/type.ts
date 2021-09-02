import type { IContext, ILogger } from '../utils';

export interface IInstance<T> {
  logger: ILogger;
  context: IContext;
  config: T;
}

export interface LoadResult {
  key: string;
  content: string;
}

export interface ITransformPayload {
  id: string;
  type: string;
}

export interface ILoadPlugin {
  name: string;
  load: <U>(
    id: string,
    instance: IInstance<U>
  ) => Promise<LoadResult | string | null | undefined>;
}

export interface ITransformPlugin<
  T extends ITransformPayload = ITransformPayload
> {
  name: string;
  resolveKey: (payload: T) => string | null | undefined;
  transform: <U>(
    payload: T,
    instance: IInstance<U>
  ) => Promise<LoadResult | null | undefined>;
}

export type IPlugin = ILoadPlugin | ITransformPlugin;
