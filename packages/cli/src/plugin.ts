import type { Plugin } from 'vite';

import path from 'path';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

import type { ICPanyConfig, ICPanyUser } from '@cpany/types';

interface IPluginOption {
  appRootPath: string;
  dataRootPath: string;
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

export function createCPanyConfigPlugin({
  appRootPath,
  dataRootPath
}: IPluginOption): Plugin {
  const configPath = path
    .join(appRootPath, 'src', 'cpany.ts')
    .replace(/\\/g, '/');

  const loadConfig = async () => {
    const content = readFileSync(path.join(dataRootPath, 'cpany.yml'), 'utf8');
    return load(content) as ICPanyConfig;
  };

  return {
    name: 'cpany:config',
    enforce: 'pre',
    async transform(code, id) {
      if (id === configPath) {
        // transfrom cpany.ts
        const config = await loadConfig();

        const userImports: string[] = [];
        const configUser = config?.users ?? {};
        for (const userName in configUser) {
          const handles: ICPanyUser['handles'] = [];

          for (const type in configUser[userName]) {
            const rawHandles = configUser[userName][type];
            const thisHandles =
              typeof rawHandles === 'string' ? [rawHandles] : rawHandles;
            handles.push(
              ...thisHandles.map((handle) => ({
                handle,
                type
              }))
            );
          }

          const user: ICPanyUser = {
            name: userName,
            handles
          };
          const stmt = `users.push(${JSON.stringify(user, null, 2)});`;
          userImports.push(stmt);
        }

        code = code.replace('/* __users__ */', userImports.join('\n'));

        return code;
      }
      return null;
    }
  };
}
