import type { IContext, ILogger } from '../utils';

export interface IInstance {
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

export interface ICleanResult {
  files: string[];
}

export interface ICleanPlugin {
  name: string;

  clean: () => Promise<ICleanResult>;

  logger?: ILogger;
}

export interface ILoadPlugin {
  name: string;

  load: (id: string, instance: IInstance) => Promise<LoadResult | string | null | undefined>;

  logger?: ILogger;
}

export interface ITransformPlugin<T extends ITransformPayload = ITransformPayload> {
  name: string;

  resolveKey: (payload: T) => string | null | undefined;

  transform: (payload: T, instance: IInstance) => Promise<LoadResult | null | undefined>;

  logger?: ILogger;
}

export type IPlugin = ICleanPlugin | ILoadPlugin | ITransformPlugin;
