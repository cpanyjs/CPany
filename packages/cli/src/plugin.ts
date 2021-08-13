import type { Plugin } from 'vite';

import path from 'path';

import type { IContestOverview, IUserOverview } from '@cpany/types';
import type { IPluginOption } from './types';
import { createLoader } from './loader';

export async function createCPanyPlugin(
  option: IPluginOption
): Promise<Plugin[]> {
  const { createUsersOverview, createContestsOverview } = await createLoader(
    option
  );

  return [
    createCPanyRoutePlugin(option),
    createCPanyOverviewPlugin(
      createUsersOverview(option.home.recent),
      createContestsOverview(option.home.contests),
      option
    )
  ];
}

export function createCPanyRoutePlugin({ appRootPath }: IPluginOption): Plugin {
  const routerPath = path
    .join(appRootPath, 'src', 'router.ts')
    .replace(/\\/g, '/');

  return {
    name: 'cpany:router',
    enforce: 'pre',
    async transform(src, id) {
      if (id === routerPath) {
        // transform router.ts
      }
      return null;
    }
  };
}

export function createCPanyOverviewPlugin(
  users: IUserOverview[],
  contests: IContestOverview[],
  { appRootPath }: IPluginOption
): Plugin {
  const overviewPath = path
    .join(appRootPath, 'src', 'overview.ts')
    .replace(/\\/g, '/');

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
