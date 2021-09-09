import type {
  IPlugin,
  LoadResult,
  ITransformPayload,
  IInstance
} from './plugin';
import { IContext, ILogger, createDefaultLogger } from './utils';

export interface ICreateOptions<T = any> {
  plugins?: Array<IPlugin | IPlugin[] | null | undefined>;
  context?: IContext;
  logger?: ILogger;
  config: T;
}

export interface CPanyInstance {
  logger: ILogger;
  context: IContext;
  load: (key: string) => Promise<LoadResult | null>;
  transform: <T extends ITransformPayload>(
    payload: T
  ) => Promise<LoadResult | null>;
}

export function createInstance<T>(option: ICreateOptions<T>): CPanyInstance {
  const logger: ILogger = option?.logger ?? createDefaultLogger();

  const plugins = (option?.plugins ?? [])
    .flat()
    .filter((plugin) => plugin !== undefined && plugin !== null) as IPlugin[];

  const context = option?.context ?? {};
  const instance: IInstance<T> = { logger, context, config: option.config };

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
        try {
          const result = await plugin.load<T>(key, instance);
          if (result !== undefined && result !== null) {
            if (typeof result === 'string') {
              cacheToContext(key, result);
              return { key, content: result };
            } else {
              cacheToContext(result.key, result.content);
              return result;
            }
          }
        } catch (error) {
          logger.error(error as string);
          return null;
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

        try {
          const result = await plugin.transform<any>(payload, instance);
          if (result !== undefined && result !== null) {
            cacheToContext(result.key, result.content);
            return result;
          } else {
            logger.error(
              `[${plugin.name}] has resolved id "${key}", but failed transforming`
            );
          }
        } catch (error) {
          logger.error(error as string);
          return null;
        }
      }
    }
    return null;
  };

  return {
    logger,
    context,
    load,
    transform
  };
}
