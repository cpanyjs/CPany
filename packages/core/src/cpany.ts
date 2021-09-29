import type {
  LoadResult,
  ITransformPayload,
  IInstance,
  IPlugin,
  ICleanResult,
  ICleanPlugin,
  ILoadPlugin,
  ITransformPlugin
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

  clean: () => Promise<ICleanResult>;

  load: (key: string) => Promise<LoadResult | null | undefined>;

  transform: <T extends ITransformPayload>(
    payload: T
  ) => Promise<LoadResult | null | undefined>;
}

export function createInstance<T>(option: ICreateOptions<T>): CPanyInstance {
  const logger: ILogger = option?.logger ?? createDefaultLogger();

  const { createLogger, cleanPlugins, loadPlugins, transformPlugins } = classifyPlugins(logger, option.plugins);

  const instanceLogger = createLogger('instance');

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

  const clean = async () => {
    const files: string[] = [];
    for (const plugin of cleanPlugins) {
      const result = await plugin.clean();
      files.push(...result.files);
    }
    return { files }
  };

  const load = async (key: string) => {
    if (isKeyInContext(key)) {
      return { key, content: loadFromContext(key) };
    }

    instanceLogger.info(`Fetch: ${key}`);

    for (const plugin of loadPlugins) {
      const pluginLogger = plugin.logger!;

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

    instanceLogger.warning(`Error: No matching plugins for ${key}`);

    return undefined;
  };

  const transform = async <T extends ITransformPayload>(payload: T) => {
    instanceLogger.info(`Fetch: (id: ${payload.id}, type: ${payload.type})`);

    for (const plugin of transformPlugins) {
      const key = plugin.resolveKey(payload);
      if (key === undefined || key === null) continue;
      if (isKeyInContext(key)) {
        return {
          key,
          content: loadFromContext(key)
        };
      }

      const pluginLogger = plugin.logger!;

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

    instanceLogger.warning(
      `Error: No matching plugins for (id: ${payload.id}, type: ${payload.type})`
    );

    return undefined;
  };

  return {
    logger: createLogger('action'),
    context,
    clean,
    load,
    transform
  };
}

function classifyPlugins(logger: ILogger, plugins?: Array<IPlugin | IPlugin[] | null | undefined>) {
  const cleanPlugins: ICleanPlugin[] = [];
  const loadPlugins: ILoadPlugin[] = [];
  const transformPlugins: ITransformPlugin[] = [];

  let loggerPrefixLength = Math.max('instance'.length, 'action'.length);
  for (const plugin of (plugins ?? []).flat()) {
    if (!plugin) continue;
    loggerPrefixLength = Math.max(loggerPrefixLength, plugin.name.split('/')[0].length);
    if ('clean' in plugin) {
      cleanPlugins.push(plugin);
    }
    if ('load' in plugin) {
      loadPlugins.push(plugin);
    }
    if ('transform' in plugin) {
      transformPlugins.push(plugin);
    }
  }

  const prefix = (name: string) => {
    return '[ ' + name + ' '.repeat(loggerPrefixLength - name.length) + ' ]';
  };

  const createLogger = (name: string) => createPrefixLogger(prefix(name), logger);

  for (const plugin of [...cleanPlugins, ...loadPlugins, ...transformPlugins]) {
    plugin.logger = createLogger(plugin.name.split('/')[0]);
  }

  return {
    createLogger,
    cleanPlugins,
    loadPlugins,
    transformPlugins
  }
}
