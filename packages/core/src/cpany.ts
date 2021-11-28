import { IUser, IHandle, IContest, ResolvedCPanyOption, Key, ParticipantType } from '@cpany/types';
import { lightRed, dim, bold } from 'kolorist';

import type { CreateOptions, CPanyInstance, FSOperations, FSEventType } from './types';
import { DefaultMaxRetry } from './constant';
import { createLoggerFactory } from './logger';
import { sleep, random, addExt } from './utils';
import {
  createPluginContainer,
  CPanyPlugin,
  FetchContext,
  LoadContext,
  isCachePlugin
} from './plugin';

export function createCPany(option: CreateOptions): CPanyInstance {
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
      logger: buildLogger(platform.length > 0 ? platform : 'main'),
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

  const fetchAll = async (option: ResolvedCPanyOption) => {
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
              logger.error(`${lightRed('Error:')} ${msg}`);
            } else {
              logger.error(`${lightRed('Error:')} unknown`);
            }
            await sleep(random(1000, 2000));
          }
        }
        // Retry all fail
        logger.error(lightRed(`Error: This task has failed ${DefaultMaxRetry} times`));
        process.exit(1);
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
            ctx.logger.info(`Fetch: ${dim(plugin.name + '/')}${bold(handle.handle)}`);

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
        ctx.logger.info(`Fetch: ${bold(plugin.name)}`);

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

  const loadAll = async (option: ResolvedCPanyOption) => {
    const handles: IHandle[] = [];
    const contests: Key<IContest>[] = [];
    const users: IUser[] = option.users.map((user) => {
      return {
        name: user.name,
        key: user.name,
        handles: [],
        contests: []
      };
    });

    const userMap = new Map(users.map((user) => [user.name, user]));
    const findUser = (name: string) => userMap.get(name);
    const handleSet = createHandleSet();
    const findHandle = (platform: string, name: string) => handleSet.findHandle(platform, name);

    function createLoadContext(platform: string): LoadContext {
      return {
        ...createFetchContext(platform),
        addHandle(...newHandles: IHandle[]) {
          handles.push(...newHandles);
          for (const handle of newHandles) {
            handleSet.addHandle(handle);
          }
        },
        addContest(...newContests: Key<IContest>[]) {
          contests.push(...newContests);
        },
        addUserContest(name, contest, author) {
          const user = findUser(name);
          if (!!user) {
            if (!user.contests.find((c) => c.key === contest.key)) {
              contest.participantNumber++;
              user.contests.push({ ...contest, author });
              return true;
            } else {
              // User has added this contest
              return false;
            }
          } else {
            // Fail to find user
            return false;
          }
        },
        findHandle,
        findUsername(platform: string, id: string) {
          for (const user of option.users) {
            for (const handle of user.handle) {
              if (platform === handle.platform && id === handle.handle) {
                return user.name;
              }
            }
          }
          return undefined;
        }
      };
    }

    for (const plugin of container.load()) {
      const context = createLoadContext(plugin.platform);
      await plugin.load(option, context);
    }

    {
      // Load static contest
      const staticContests: IContest[] = [];
      const staticLoadCtx = createLoadContext('');
      for (const dir of option.static.contests) {
        const contests = await staticLoadCtx.readJsonDir<IContest>(dir);
        for (const contest of contests) {
          contest.inlinePage = true;
          staticContests.push(contest);
        }
      }

      const indexed = genKey(staticContests);
      for (const contest of indexed) {
        staticLoadCtx.addContest(contest);
        // Use username to push static contest
        for (const standing of contest.standings ?? []) {
          // skip PRACTICE contest participant
          if (standing.author.participantType === ParticipantType.PRACTICE) continue;

          const push = (name?: string) => {
            if (!name) return false;
            const user = userMap.get(name);
            if (user !== null && user !== undefined) {
              staticLoadCtx.addUserContest(user.name, contest, standing.author);
              return true;
            }
            return false;
          };

          // use teamName or members
          if (push(standing.author.teamName)) continue;
          for (const member of standing.author.members) {
            push(member);
          }
        }
      }

      // Load static handle
      for (const dir of option.static.handles) {
        const handles = await staticLoadCtx.readJsonDir<IHandle>(dir);
        staticLoadCtx.addHandle(...handles);
      }
    }

    const indexedHandles = genKey(handles);
    const indexedContests = contests.sort((lhs, rhs) => lhs.startTime - rhs.startTime);

    for (const { name, handle } of option.users) {
      const user = findUser(name)!;
      user.handles = filterMap(handle, (handle) => {
        const res = findHandle(handle.platform, handle.handle);
        if (res === undefined) {
          logger.debug(
            `Not found: (handle: ${handle.handle}, platform: ${handle.platform}) of ${user.name}`
          );
        }
        return res;
      });
    }

    // Reverse sort user contest
    for (const user of users) {
      user.contests = user.contests.sort(
        (lhs, rhs) => rhs.author.participantTime - lhs.author.participantTime
      );
    }

    return {
      handles: indexedHandles,
      contests: indexedContests,
      users
    };
  };

  return {
    logger,
    platforms: container.platforms,
    cache,
    fetch,
    query,
    fetchAll,
    loadAll,
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

function genKey<T extends IContest | IHandle>(rawFiles: T[], sortFn?: (lhs: T, rhs: T) => number) {
  const mapByType: Map<string, T[]> = new Map();
  for (const file of rawFiles) {
    if (mapByType.has(file.type)) {
      mapByType.get(file.type)!.push(file);
    } else {
      mapByType.set(file.type, [file]);
    }
  }
  const files: Array<Key<T>> = [];
  for (const [type, rawFiles] of mapByType.entries()) {
    const sorted = rawFiles.sort(sortFn);
    mapByType.set(type, sorted);

    // Dep: try use T.id as key
    const keys = sorted.map((file) => {
      if ('id' in file) {
        return String(file.id);
      } else {
        return null;
      }
    });
    const flag = keys.every((key) => key !== null) && new Set(keys).size === keys.length;

    for (let i = 0; i < sorted.length; i++) {
      const key = flag ? keys[i]! : String(i + 1);
      files.push({
        key,
        ...sorted[i]
      } as Key<T>);
    }
  }

  return files.sort(sortFn);
}

function filterMap<T, U>(array: readonly T[], fn: (arg: T) => U | undefined): U[] {
  return array.map(fn).filter((u) => u !== undefined && u !== null) as U[];
}

function createHandleSet() {
  const mapByType: Map<string, Map<string, IHandle>> = new Map();

  const norm = (raw: string) => raw.split('/')[0];

  const addHandle = (handle: IHandle) => {
    const type = norm(handle.type);
    if (mapByType.has(type)) {
      mapByType.get(type)!.set(handle.handle, handle);
    } else {
      const map: Map<string, IHandle> = new Map();
      map.set(handle.handle, handle);
      mapByType.set(type, map);
    }
  };

  const findHandle = (_type: string, handle: string) => {
    const type = norm(_type);
    if (mapByType.has(type)) {
      const map = mapByType.get(type)!;
      if (map.has(handle)) {
        return map.get(handle)!;
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  };

  return {
    addHandle,
    findHandle
  };
}
