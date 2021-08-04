import type { IPlugin, LoadResult, ITransformPayload } from './plugin';
import type { IContext, ILogger } from './utils';

export interface ICreateOptions {
  plugins?: IPlugin[];
  context?: IContext;
  logger?: ILogger;
}

export interface CPanyInstance {
  load: (key: string) => Promise<LoadResult | null>;
  transform: <T extends ITransformPayload>(
    payload: T
  ) => Promise<LoadResult | null>;
}

export function createInstance(option: ICreateOptions): CPanyInstance {
  const logger = option?.logger ?? console;

  const plugins = option?.plugins ?? [];

  const context = option?.context ?? {};

  const isKeyInContext = (key: string) => {
    return key in context;
  };

  const loadFromContext = (key: string) => {
    return context[key];
  };

  const cacheToContext = (key: string, content: string) => {
    context[key] = content;
  };

  const load = async (key: string) => {
    if (isKeyInContext(key)) {
      return { key, content: loadFromContext(key) };
    }

    for (const plugin of plugins) {
      if ('load' in plugin) {
        const result = await plugin.load(key, context);
        if (result !== undefined && result !== null) {
          if (typeof result === 'string') {
            cacheToContext(key, result);
            return { key, content: result };
          } else {
            cacheToContext(result.key, result.content);
            return result;
          }
        }
      }
    }
    return null;
  };

  const transform = async <T extends ITransformPayload>(payload: T) => {
    for (const plugin of plugins) {
      if ('transform' in plugin) {
        const key = plugin.resolveKey(payload);
        if (key === undefined || key === null) continue;
        if (isKeyInContext(key)) {
          return {
            key,
            content: loadFromContext(key)
          };
        }

        const result = await plugin.transform(payload, context);
        if (result !== undefined && result !== null) {
          cacheToContext(result.key, result.content);
          return result;
        } else {
          logger.error(
            `[${plugin.name}] has resolved id "${key}", but failed transforming`
          );
        }
      }
    }
    return null;
  };

  return {
    load,
    transform
  };
}
