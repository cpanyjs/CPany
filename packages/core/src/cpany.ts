import type {
  IPlugin,
  LoadResult,
  ITransformPayload,
  IInstance
} from './plugin';
import {
  IContext,
  ILogger,
  createDefaultLogger,
  createPrefixLogger
} from './utils';

export interface ICreateOptions<T = any> {
  plugins?: Array<IPlugin | IPlugin[] | null | undefined>;
  context?: IContext;
  logger?: ILogger;
  config: T;
}

export interface CPanyInstance {
  logger: ILogger;
  context: IContext;
  load: (key: string) => Promise<LoadResult | null | undefined>;
  transform: <T extends ITransformPayload>(
    payload: T
  ) => Promise<LoadResult | null | undefined>;
}

export function createInstance<T>(option: ICreateOptions<T>): CPanyInstance {
  const logger: ILogger = option?.logger ?? createDefaultLogger();

  const plugins = (option?.plugins ?? [])
    .flat()
    .filter((plugin) => plugin !== undefined && plugin !== null) as IPlugin[];

  const loggerPrefixLength = ['instance']
    .concat(plugins.map((plugin) => plugin.name))
    .reduce((len, name) => Math.max(len, name.length), 0);
  const prefix = (name: string = 'instance') => {
    return '[ ' + name + ' '.repeat(loggerPrefixLength - name.length) + ' ]';
  };
  const instanceLogger = createPrefixLogger(prefix(), logger);

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

    instanceLogger.info(`Fetch: ${key}`);

    for (const plugin of plugins) {
      if ('load' in plugin) {
        const pluginLogger = createPrefixLogger(prefix(plugin.name), logger);
        try {
          const result = await plugin.load<T>(key, {
            ...instance,
            logger: pluginLogger
          });
          if (result !== undefined && result !== null) {
            pluginLogger.info(`Ok   : ${key}`);
            if (typeof result === 'string') {
              cacheToContext(key, result);
              return { key, content: result };
            } else {
              cacheToContext(result.key, result.content);
              return result;
            }
          }
        } catch (error) {
          pluginLogger.error(`Error: Fetch "${key}" fail`);
          return null;
        }
      }
    }

    instanceLogger.warning(`Error: No matching plugins for ${key}`);

    return undefined;
  };

  const transform = async <T extends ITransformPayload>(payload: T) => {
    instanceLogger.info(`Fetch: (id: ${payload.id}, type: ${payload.type})`);

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

        const pluginLogger = createPrefixLogger(prefix(plugin.name), logger);
        try {
          const result = await plugin.transform<any>(payload, {
            ...instance,
            logger: pluginLogger
          });
          if (result !== undefined && result !== null) {
            pluginLogger.info(`Ok   : ${result.key}`);
            cacheToContext(result.key, result.content);
            return result;
          } else {
            pluginLogger.error(
              `Error: has resolved id "${key}", but failed transforming`
            );
          }
        } catch (error) {
          pluginLogger.error(
            `Error: Fetch (id: ${payload.id}, type: ${payload.type}) fail`
          );
          return null;
        }
      }
    }

    instanceLogger.warning(
      `Error: No matching plugins for (id: ${payload.id}, type: ${payload.type})`
    );

    return undefined;
  };

  return {
    logger: instanceLogger,
    context,
    load,
    transform
  };
}
