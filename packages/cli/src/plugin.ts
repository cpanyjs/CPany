import type { Plugin } from 'vite';

import path from 'path';

import type {
  IContestOverview,
  IUserOverview,
  IContest,
  RouteKey,
  IUser
} from '@cpany/types';
import type { IPluginOption } from './types';
import { createLoader } from './loader';
import { slash } from './utils';
import { DefaultRecentContestsCount, DefaultRecentTime } from './constant';

export async function createCPanyPlugin(
  option: IPluginOption
): Promise<Plugin[]> {
  const {
    config,
    contests,
    users,
    createUsersOverview,
    createContestsOverview,
    createOverview
  } = await createLoader(option);

  const staticContests = contests.filter((contest) => contest.inlinePage);

  return [
    createCPanyOverviewPlugin(
      createUsersOverview(config.app?.recentTime ?? DefaultRecentTime),
      createContestsOverview(
        config.app?.recentContestsCount ?? DefaultRecentContestsCount
      ),
      createOverview(),
      option
    ),
    createCPanyRoutePlugin(users, staticContests, option),
    createCPanyContestPagePlugin(staticContests, option),
    createCPanyUserPagePlugin(users, option),
    createCPanyLoadPlugin(users, contests, option)
  ];
}

export function createCPanyOverviewPlugin(
  users: IUserOverview[],
  contests: IContestOverview[],
  overview: Map<string, string>,
  { appRootPath }: IPluginOption
): Plugin {
  const overviewPath = slash(path.join(appRootPath, 'src', 'overview.ts'));

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
          [...overview.entries()]
            .map(([key, value]) => `${key} = ${value};`)
            .join('\n')
        );
        code = code.replace('/* __users__ */', usersImports.join('\n'));
        code = code.replace('/* __contests__ */', contestsImports.join('\n'));

        return code;
      }
      return null;
    }
  };
}

function contestVirtualComponentPath(contestPath: string) {
  return slash(path.join('@cpany', contestPath + '.vue'));
}

function userVirtualComponentPath(username: string) {
  return slash(path.join('@cpany', 'users', username + '.vue'));
}

export function createCPanyRoutePlugin(
  users: IUser[],
  contests: RouteKey<IContest>[],
  { appRootPath }: IPluginOption
): Plugin {
  const routerPath = slash(path.join(appRootPath, 'src', 'router.ts'));

  return {
    name: 'cpany:router',
    enforce: 'pre',
    async transform(code, id) {
      if (id === routerPath) {
        // transform router.ts
        const virtualRoutes = contests.map((contest) => {
          const path = contestVirtualComponentPath(contest.path);
          return `{ path: \`${contest.path}\`, component: () => import(\`${path}\`), meta: { title: \`${contest.name} - CPany\` } },`;
        });
        virtualRoutes.push(
          ...users.map((user) => {
            const path = userVirtualComponentPath(user.name);
            return `{ path: \`/user/${user.name}\`, component: () => import(\`${path}\`), meta: { title: \`用户 ${user.name} - CPany\` } },`;
          })
        );

        code = code.replace(
          '/* __contests__ */',
          `routes.push(${virtualRoutes.join('\n')});`
        );

        return code;
      }
      return null;
    }
  };
}

export function createCPanyContestPagePlugin(
  contests: RouteKey<IContest>[],
  { appRootPath }: IPluginOption
): Plugin {
  const componentPath = slash(
    path.join(appRootPath, 'src', 'pages', 'Contest', 'Contest.vue')
  );

  const virtualContestJson = (contestPath: string) =>
    slash(path.join('@cpany', contestPath + '.json'));

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
          `import page from "${componentPath}"`,
          `import contest from "${virtualContestJson(virtualContest.path)}"`,
          `export default {`,
          `  components: { page },`,
          `  setup() {`,
          `    return { contest };`,
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

export function createCPanyUserPagePlugin(
  users: IUser[],
  { appRootPath }: IPluginOption
): Plugin {
  const componentPath = slash(
    path.join(appRootPath, 'src', 'pages', 'User', 'User.vue')
  );

  const virtualUserJson = (username: string) =>
    slash(path.join('@cpany', 'users', username + '.json'));

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
          `import page from "${componentPath}"`,
          `import user from "${virtualUserJson(virtualUser.name)}"`,
          `export default {`,
          `  components: { page },`,
          `  setup() {`,
          `    return { user };`,
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
  users: IUser[],
  contests: RouteKey<IContest>[],
  { appRootPath }: IPluginOption
): Plugin {
  const contestsPath = slash(
    path.join(appRootPath, 'src', 'cpany', 'contests.json')
  );
  const codeforcesPath = slash(
    path.join(appRootPath, 'src', 'cpany', 'codeforces.json')
  );
  const usersPath = slash(path.join(appRootPath, 'src', 'cpany', 'users.json'));

  return {
    name: 'cpany:load',
    enforce: 'pre',
    transform(code, id) {
      if (id === contestsPath) {
        const otherContests = contests.filter(
          (contest) => !contest.type.startsWith('codeforces')
        );
        return JSON.stringify(otherContests, null, 2);
      } else if (id === codeforcesPath) {
        const codeforcesContests = contests.filter((contest) =>
          contest.type.startsWith('codeforces')
        );
        return JSON.stringify(codeforcesContests, null, 2);
      } else if (id === usersPath) {
        return JSON.stringify(users, null, 2);
      }
    }
  };
}
