import type { IContext, ILogger } from '../utils';

interface IInstance {
  logger: ILogger;
  context: IContext;
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
  load: (
    id: string,
    instance: IInstance
  ) => Promise<LoadResult | string | null | undefined>;
}

export interface ITransformPlugin<
  T extends ITransformPayload = ITransformPayload
> {
  name: string;
  resolveKey: (payload: T) => string | null | undefined;
  transform: (
    payload: T,
    instance: IInstance
  ) => Promise<LoadResult | null | undefined>;
}

export type IPlugin = ILoadPlugin | ITransformPlugin;
