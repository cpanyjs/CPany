import { ResolvedCPanyOption } from '@cpany/types';

import { CreateOptions, CPanyFetcher, FSOperations, FSEventType } from './types';
import { DefaultMaxRetry } from './constant';
import { createLoggerFactory } from './logger';
import { createPluginContainer, CPanyPlugin, FetchContext, isCachePlugin } from './plugin';
import { sleep, random } from './utils';

export function createFetcher(option: CreateOptions): CPanyFetcher {
  const { on, getFSFn } = getFSOperation();

  const container = createPluginContainer(option.plugins);

  const buildLogger = createLoggerFactory(
    ['main', ...container.platforms],
    option.logLevel,
    option.logger
  );

  const logger = buildLogger('main');

  function createFetchContext(platform: string): FetchContext {
    return {
      logger: buildLogger(platform),
      async readJsonFile(filename: string) {
        const readFile = getFSFn('read');
        if (!!readFile) {
          const content = await readFile(platform, addExt(filename));
          return JSON.parse(content);
        } else {
          throw new Error('No FS <read> function is provided.');
        }
      },
      async readJsonDir(rootDir: string) {
        const readFile = getFSFn('read');
        const listDir = getFSFn('list');
        if (!!readFile) {
          if (!!listDir) {
            const files = await listDir(platform, platform, rootDir);
            const contents = [];
            for (const filename of files) {
              const content = await readFile(platform, filename);
              const raw = JSON.parse(content);
              if (Array.isArray(raw)) {
                contents.push(...raw);
              } else if (typeof raw === 'object') {
                contents.push(raw);
              }
            }
            return contents;
          } else {
            throw new Error('No FS <list> function is provided.');
          }
        } else {
          throw new Error('No FS <read> function is provided.');
        }
      },
      async listDir(rootDir: string) {
        const listDir = getFSFn('list');
        if (!!listDir) {
          return await listDir(platform, platform, rootDir);
        } else {
          throw new Error('No FS <list> function is provided.');
        }
      },
      async writeFile(content: string, filename: string) {
        const writeFile = getFSFn('write');
        if (!!writeFile) {
          await writeFile(content, platform, filename);
        } else {
          throw new Error('No FS <write> function is provided.');
        }
      },
      async removeFile(filename: string) {
        const removeFile = getFSFn('remove');
        if (!!removeFile) {
          await removeFile(platform, filename);
        } else {
          throw new Error('No FS <remove> function is provided.');
        }
      }
    };
  }

  const cache = async () => {
    await Promise.all(
      container.cache().map((plugin) => plugin.cache(createFetchContext(plugin.name)))
    );
  };

  const fetch = async (platform: string, name: string) => {
    for (const plugin of container.fetch(platform)) {
      if (plugin.name === name) {
        const result = await plugin.fetch(createFetchContext(plugin.platform));
        if (!!result) {
          if (typeof result === 'object') {
            return result.content;
          } else {
            return result;
          }
        } else {
          // Fetch fail here
          return undefined;
        }
      }
    }
    // Plugin not found
    return undefined;
  };

  const query = async (platform: string, name: string, payload: string | number) => {
    const plugin = container.query(platform, name);
    if (!!plugin) {
      const result = await plugin.query(String(payload), createFetchContext(plugin.platform));
      if (!!result) {
        if (typeof result === 'object') {
          return result.content;
        } else {
          return result;
        }
      } else {
        // Query fail here
        return undefined;
      }
    } else {
      // Plugin not found
      return undefined;
    }
  };

  const run = async (option: ResolvedCPanyOption) => {
    type Task = () => Promise<void>;

    const initTasks: Task[] = [];
    const preTasks: Task[] = [];
    const tasks: Task[] = [];
    const postTasks: Task[] = [];

    const pushTask = (plugin: CPanyPlugin, rawTask: Task) => {
      const task = async () => {
        const logger = buildLogger(plugin.platform);
        for (let i = 0; i <= DefaultMaxRetry; i++) {
          try {
            await rawTask();
            return;
          } catch (error: any) {
            const msg = error.message;
            if (typeof msg === 'string') {
              logger.error(`Error: ${msg}`);
            } else {
              logger.error(`Error: unknown`);
            }
            await sleep(random(1000, 2000));
          }
        }
      };

      if (plugin.enforce === 'pre') {
        preTasks.push(task);
      } else if (plugin.enforce === 'post') {
        postTasks.push(task);
      } else {
        if (isCachePlugin(plugin)) {
          initTasks.push(task);
        } else {
          tasks.push(task);
        }
      }
    };

    for (const user of option.users) {
      for (const handle of user.handle) {
        const plugin = container.query(handle.platform, 'handle');
        if (!!plugin) {
          const ctx = createFetchContext(plugin.platform);

          pushTask(plugin, async () => {
            ctx.logger.info(`Fetch: ${handle.platform}/${plugin.name}/${handle.handle}`);

            const result = await plugin.query(handle.handle, ctx);

            if (!!result) {
              if (typeof result === 'string') {
                await ctx.writeFile(result, addExt(`${plugin.name}/${handle.handle}`));
              } else {
                await ctx.writeFile(result.content, result.filename);
              }
            } else {
              // Internal Error
            }
          });
        }
      }
    }

    for (const plugin of container.cache()) {
      const ctx = createFetchContext(plugin.platform);

      pushTask(plugin, async () => {
        await plugin.cache(ctx);
      });
    }

    for (const plugin of container.fetch()) {
      const ctx = createFetchContext(plugin.platform);

      pushTask(plugin, async () => {
        ctx.logger.info(`Fetch: ${plugin.platform}/${plugin.name}`);

        const result = await plugin.fetch(ctx);

        if (!!result) {
          if (typeof result === 'string') {
            await ctx.writeFile(result, addExt(plugin.name));
          } else {
            await ctx.writeFile(result.content, result.filename);
          }
        } else {
          // Internal Error
        }
      });
    }

    logger.startGroup('Cache');
    for (const task of initTasks) await task();
    logger.endGroup();

    logger.startGroup('Fetch data');
    for (const task of preTasks) await task();
    for (const task of tasks) await task();
    for (const task of postTasks) await task();
    logger.endGroup();
  };

  return {
    logger,
    platforms: container.platforms,
    cache,
    fetch,
    query,
    run,
    on
  };
}

function getFSOperation() {
  const container: Partial<FSEventType> = {};

  const on: FSOperations['on'] = (ev, fn) => {
    container[ev] = fn;
  };

  return {
    on,
    getFSFn<T extends keyof FSEventType>(ev: T): FSEventType[T] | undefined {
      if (ev === 'read') {
        return container[ev] as FSEventType[T];
      } else if (ev === 'list') {
        return container[ev] as FSEventType[T];
      } else if (ev === 'write') {
        return container[ev] as FSEventType[T];
      } else if (ev === 'remove') {
        return container[ev] as FSEventType[T];
      } else {
        return undefined;
      }
    }
  };
}

function addExt(filename: string, ext = 'json') {
  if (filename.endsWith(`.${ext}`)) {
    return filename;
  } else {
    return `${filename}.${ext}`;
  }
}
