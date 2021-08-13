import type { Plugin } from 'vite';

import path from 'path';

import type {
  IContestOverview,
  IUserOverview,
  IContest,
  RouteKey
} from '@cpany/types';
import type { IPluginOption } from './types';
import { createLoader } from './loader';
import { slash } from './utils';

export async function createCPanyPlugin(
  option: IPluginOption
): Promise<Plugin[]> {
  const { contests, createUsersOverview, createContestsOverview } =
    await createLoader(option);

  const staticContests = contests.filter((contest) => contest.static);

  return [
    createCPanyOverviewPlugin(
      createUsersOverview(option.home.recent),
      createContestsOverview(option.home.contests),
      option
    ),
    createCPanyRoutePlugin(staticContests, option),
    createCPanyContestPagePlugin(staticContests, option),
    createCPanyContestLoadPlugin(contests, option)
  ];
}

export function createCPanyOverviewPlugin(
  users: IUserOverview[],
  contests: IContestOverview[],
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

export function createCPanyRoutePlugin(
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
          return `{ path: \`${contest.path}\`, component: () => import(\`${path}\`) },`;
        });

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

export function createCPanyContestLoadPlugin(
  contests: RouteKey<IContest>[],
  { appRootPath }: IPluginOption
): Plugin {
  const contestsPath = slash(path.join(appRootPath, 'src', 'contests.ts'));

  const contestPushes = contests.map(
    (contest) => `${JSON.stringify(contest, null, 2)},`
  );

  return {
    name: 'cpany:contest',
    enforce: 'pre',
    transform(code, id) {
      if (id === contestsPath) {
        code = code.replace(
          '/* __contests__ */',
          `contests.push(${contestPushes.join('\n')});`
        );
        return code;
      }
    }
  };
}
