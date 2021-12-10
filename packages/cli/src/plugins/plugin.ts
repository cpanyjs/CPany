import { Plugin, normalizePath } from 'vite';

import path from 'path';
import fs from 'fs';

import type {
  IContestOverview,
  IUserOverview,
  IContest,
  RouteKey,
  IUser,
  CompressHandleList
} from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';

import type { IPluginOption } from '../types';
import { now } from '../utils';
import { createLoader } from './loader';

export async function createCPanyPlugin(option: IPluginOption): Promise<Plugin[]> {
  const { contests, users, createUsersOverview, createContestsOverview, createOverview } =
    await createLoader(option);

  const staticContests = contests.filter((contest) => contest.inlinePage);

  return [
    createDefineMetaPlugin(option),
    createCPanyOverviewPlugin(
      createUsersOverview(option.option.app.recentTime),
      createContestsOverview(option.option.app.recentContestsCount),
      createOverview(),
      option
    ),
    createCPanyRoutePlugin(users, staticContests, option),
    createCPanyContestPagePlugin(staticContests, option),
    createCPanyUserPagePlugin(users, option),
    createCPanyLoadPlugin(createUsersOverview(-1), contests, option)
  ];
}

export function createDefineMetaPlugin({ dataRoot }: IPluginOption): Plugin {
  const load = () => {
    const envMap: Map<string, string> = new Map();
    try {
      const rawContent = fs.readFileSync(path.join(dataRoot, '.env'), 'utf8');
      const content = rawContent.trim().replace(/\r?\n/, '\n').split('\n');
      for (const _line of content) {
        const line = _line.trim();
        if (line === '') continue;
        const [key, value] = line
          .split('=')
          .map((s) => s.trim())
          .filter((s) => s !== '');
        envMap.set(key, value);
      }
    } catch (error) {
      console.log((error as any).message);
    } finally {
      return envMap;
    }
  };

  const env = load();
  const FetchTimestamp = env.get('UPDATE_TIME') ?? '';
  const BuildTimestamp = String(now().getTime() / 1000);

  return {
    name: 'cpany:define',
    config: () => ({
      define: {
        __FETCH_TIMESTAMP__: FetchTimestamp,
        __BUILD_TIMESTAMP__: BuildTimestamp
      }
    })
  };
}

export function createCPanyOverviewPlugin(
  users: IUserOverview[],
  contests: IContestOverview[],
  overview: Map<string, string>,
  { appRoot }: IPluginOption
): Plugin {
  const overviewPath = normalizePath(path.join(appRoot, 'src', 'overview.ts'));

  return {
    name: 'cpany:overview',
    enforce: 'pre',
    async transform(code, id) {
      if (id === overviewPath) {
        // transfrom cpany.ts
        const usersImports: string[] = users.map(
          (user) => `users.push(${JSON.stringify(user, null, 2)});`
        );
        const contestsImports: string[] = contests.map(
          (contest) => `contests.push(${JSON.stringify(contest, null, 2)});`
        );

        code = code.replace(
          '/* __inject__ */',
          [...overview.entries()].map(([key, value]) => `${key} = ${value};`).join('\n')
        );
        code = code.replace('/* __users__ */', usersImports.join('\n'));
        code = code.replace('/* __contests__ */', contestsImports.join('\n'));

        return code;
      }
      return null;
    }
  };
}

function contestVirtualComponentPath(contestPath: string, relative = false) {
  if (relative) return './' + normalizePath(path.join('./', contestPath + '.vue'));
  return normalizePath(path.join('~cpany', contestPath + '.vue'));
}

function userVirtualComponentPath(username: string, relative = false) {
  if (relative) return './' + normalizePath(path.join('./', 'users', username + '.vue'));
  return normalizePath(path.join('~cpany', 'users', username + '.vue'));
}

export function createCPanyRoutePlugin(
  users: IUser[],
  contests: RouteKey<IContest>[],
  option: IPluginOption
): Plugin {
  const virtualRoutesFile = '~cpany/routes';

  return {
    name: 'cpany:router',
    resolveId(id) {
      return id === virtualRoutesFile ? virtualRoutesFile + '.js' : null;
    },
    async load(id) {
      if (id === virtualRoutesFile + '.js') {
        const virtualRoutes = [
          ...contests.map((contest) => {
            // In dev server, use relative path
            // In build, use absolute path
            const path = contestVirtualComponentPath(contest.path, option.dev);
            return `{ path: \`${contest.path}\`, component: () => import(\`${path}\`), meta: { title: \`${contest.name} - CPany\` } },`;
          }),
          ...users.map((user) => {
            const path = userVirtualComponentPath(user.name, option.dev);
            return `{ path: \`/user/${user.name}\`, component: () => import(\`${path}\`), meta: { title: \`用户 ${user.name} - CPany\` } },`;
          })
        ];

        const routes = `export const routes = [${virtualRoutes.join('\n')}];`;
        const base = `export const base = '${option.base}';`;

        return base + '\n' + routes + '\n';
      }
      return null;
    }
  };
}

export function createCPanyContestPagePlugin(
  contests: RouteKey<IContest>[],
  { appRoot }: IPluginOption
): Plugin {
  const componentPath = normalizePath(path.join(appRoot, 'src', 'pages', 'Contest', 'Contest.vue'));

  const virtualContestJson = (contestPath: string) =>
    normalizePath(path.join('~cpany', contestPath + '.json'));

  const findVirtualContestJson = (id: string): RouteKey<IContest> | null => {
    if (!id.endsWith('.json')) return null;
    for (const contest of contests) {
      if (id === virtualContestJson(contest.path)) {
        return contest;
      }
    }
    return null;
  };

  const findVirtualContestPage = (id: string): RouteKey<IContest> | null => {
    if (!id.endsWith('.vue')) return null;
    for (const contest of contests) {
      if (id === contestVirtualComponentPath(contest.path)) {
        return contest;
      }
    }
    return null;
  };

  return {
    name: 'cpany:contest_page',
    resolveId(id) {
      if (findVirtualContestPage(id)) {
        return id;
      } else if (findVirtualContestJson(id)) {
        return id;
      }
    },
    load(id) {
      const virtualContest = findVirtualContestPage(id);
      if (virtualContest !== null) {
        const component = [
          `<template><page :contest="contest" /></template>`,
          `<script>`,
          `import { load } from '@cpany/compress/load';`,
          `import page from "${componentPath}"`,
          `import contest from "${virtualContestJson(virtualContest.path)}"`,
          `export default {`,
          `  components: { page },`,
          `  setup() {`,
          `    return { contest: load(contest) };`,
          `  }`,
          `}`,
          `</script>`
        ];
        return component.join('\n');
      } else {
        const virtualContest = findVirtualContestJson(id);
        if (virtualContest !== null) {
          return JSON.stringify(virtualContest, null, 2);
        }
      }
    }
  };
}

export function createCPanyUserPagePlugin(users: IUser[], { appRoot }: IPluginOption): Plugin {
  const componentPath = normalizePath(path.join(appRoot, 'src', 'pages', 'User', 'User.vue'));

  const virtualUserJson = (username: string) =>
    normalizePath(path.join('~cpany', 'users', username + '.json'));

  const findvirtualUserJson = (id: string): IUser | null => {
    if (!id.endsWith('.json')) return null;
    for (const user of users) {
      if (id === virtualUserJson(user.name)) {
        return user;
      }
    }
    return null;
  };

  const findVirtualUserPage = (id: string): IUser | null => {
    if (!id.endsWith('.vue')) return null;
    for (const user of users) {
      if (id === userVirtualComponentPath(user.name)) {
        return user;
      }
    }
    return null;
  };

  return {
    name: 'cpany:user_page',
    resolveId(id) {
      if (findVirtualUserPage(id)) {
        return id;
      } else if (findvirtualUserJson(id)) {
        return id;
      }
    },
    load(id) {
      const virtualUser = findVirtualUserPage(id);
      if (virtualUser !== null) {
        const component = [
          `<template><page :user="user" /></template>`,
          `<script>`,
          `import { load } from '@cpany/compress/load';`,
          `import page from "${componentPath}"`,
          `import user from "${virtualUserJson(virtualUser.name)}"`,
          `export default {`,
          `  components: { page },`,
          `  setup() {`,
          `    return { user: load(user) };`,
          `  }`,
          `}`,
          `</script>`
        ];
        return component.join('\n');
      } else {
        const virtualUser = findvirtualUserJson(id);
        if (virtualUser !== null) {
          return JSON.stringify(virtualUser, null, 2);
        }
      }
    }
  };
}

export function createCPanyLoadPlugin(
  users: IUserOverview[],
  contests: RouteKey<IContest>[],
  { appRoot }: IPluginOption
): Plugin {
  const contestsPath = normalizePath(path.join(appRoot, 'src', 'cpany', 'contests.json'));
  const codeforcesPath = normalizePath(path.join(appRoot, 'src', 'cpany', 'codeforces.json'));
  const usersPath = normalizePath(path.join(appRoot, 'src', 'cpany', 'users.json'));
  const cfHandlesPath = normalizePath(path.join(appRoot, 'src', 'cpany', 'cfHandles.json'));
  const atHandlesPath = normalizePath(path.join(appRoot, 'src', 'cpany', 'atHandles.json'));

  return {
    name: 'cpany:load',
    enforce: 'pre',
    transform(code, id) {
      if (id === contestsPath) {
        const otherContests = contests.filter((contest) => !contest.type.startsWith('codeforces'));
        return JSON.stringify(otherContests, null, 2);
      } else if (id === codeforcesPath) {
        const codeforcesContests = contests.filter((contest) =>
          contest.type.startsWith('codeforces')
        );
        return JSON.stringify(codeforcesContests, null, 2);
      } else if (id === usersPath) {
        return JSON.stringify(users, null, 2);
      } else if (id === cfHandlesPath) {
        const handles = ([] as CompressHandleList).concat(
          ...users.map(({ name, handles }) => {
            const cfHandles: CompressHandleList = [];
            for (const handle of handles) {
              if (handle.type.startsWith('codeforces')) {
                const cfHandle = handle as Omit<RouteKey<IHandleWithCodeforces>, 'submissions'>;
                cfHandles.push({
                  n: name,
                  h: handle.handle,
                  r: cfHandle.codeforces?.rating ?? 0
                });
              }
            }
            return cfHandles;
          })
        );
        return JSON.stringify(handles, null, 2);
      } else if (id === atHandlesPath) {
        const handles = ([] as CompressHandleList).concat(
          ...users.map(({ name, handles }) => {
            const atHandles: CompressHandleList = [];
            for (const handle of handles) {
              if (handle.type.startsWith('atcoder')) {
                const atHandle = handle as Omit<RouteKey<IHandleWithAtCoder>, 'submissions'>;
                atHandles.push({
                  n: name,
                  h: handle.handle,
                  r: atHandle.atcoder.rating ?? 0
                });
              }
            }
            return atHandles;
          })
        );
        return JSON.stringify(handles, null, 2);
      }
    }
  };
}
