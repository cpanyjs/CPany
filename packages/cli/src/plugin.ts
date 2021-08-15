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
    createCPanyContestLoadPlugin(contests, option),
    createCPanyUserLoadPlugin(users, option)
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

  const contestVirtualComponents = new Map(
    contests.map((contest): [string, string] => {
      const path = contestVirtualComponentPath(contest.path);
      const component = [
        '<template><page :contest="contest" /></template>',
        '<script setup lang="ts">',
        `import page from "${componentPath}"`,
        `const contest = ${JSON.stringify(contest)};`,
        '</script>'
      ];
      return [path, component.join('\n')];
    })
  );

  return {
    name: 'cpany:contest_page',
    resolveId(id) {
      if (contestVirtualComponents.has(id)) {
        return id;
      }
    },
    load(id) {
      if (contestVirtualComponents.has(id)) {
        return contestVirtualComponents.get(id)!;
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

  const userVirtualComponents = new Map(
    users.map((user): [string, string] => {
      const path = userVirtualComponentPath(user.name);
      const component = [
        '<template><page :user="user" /></template>',
        '<script setup lang="ts">',
        `import page from "${componentPath}"`,
        `const user = ${JSON.stringify(user)};`,
        '</script>'
      ];
      return [path, component.join('\n')];
    })
  );

  return {
    name: 'cpany:user_page',
    resolveId(id) {
      if (userVirtualComponents.has(id)) {
        return id;
      }
    },
    load(id) {
      if (userVirtualComponents.has(id)) {
        return userVirtualComponents.get(id)!;
      }
    }
  };
}

export function createCPanyContestLoadPlugin(
  contests: RouteKey<IContest>[],
  { appRootPath }: IPluginOption
): Plugin {
  const contestsPath = slash(path.join(appRootPath, 'src', 'contests.ts'));
  const codeforcesPath = slash(path.join(appRootPath, 'src', 'codeforces.ts'));

  const contestPushes = contests
    .filter((contest) => !contest.type.startsWith('codeforces'))
    .map((contest) => `${JSON.stringify(contest, null, 2)},`);
  const codeforcesPushes = contests
    .filter((contest) => contest.type.startsWith('codeforces'))
    .map((contest) => `${JSON.stringify(contest, null, 2)},`);

  return {
    name: 'cpany:contest',
    enforce: 'pre',
    transform(code, id) {
      if (id === contestsPath) {
        // Hack: sort splited contests
        code = code.replace(
          '/* __contests__ */',
          `contests.push(${contestPushes.join('\n')});\n` +
            `contests.sort((lhs, rhs) => rhs.startTime - lhs.startTime);`
        );
        return code;
      } else if (id === codeforcesPath) {
        code = code.replace(
          '/* __contests__ */',
          `contests.push(${codeforcesPushes.join('\n')});`
        );
        return code;
      }
    }
  };
}

export function createCPanyUserLoadPlugin(
  users: IUser[],
  { appRootPath }: IPluginOption
): Plugin {
  const usersPath = slash(path.join(appRootPath, 'src', 'users.ts'));

  const userPushes = users.map((user) => `${JSON.stringify(user, null, 2)},`);

  return {
    name: 'cpany:users',
    enforce: 'pre',
    transform(code, id) {
      if (id === usersPath) {
        code = code.replace(
          '/* __users__ */',
          `users.push(${userPushes.join('\n')});`
        );
        return code;
      }
    }
  };
}
