import path from 'path';
import { InlineConfig, mergeConfig } from 'vite';
import isInstalledGlobally from 'is-installed-globally';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';

import Compress from '@cpany/compress';
import { uniq } from '@cpany/utils';

import type { ICliOption } from './types';
import { resolveImportPath } from './utils';
import { createCPanyPlugin } from './plugin';
import { version } from './version';
import { readFileSync } from 'fs';
import { searchForWorkspaceRoot } from './searchRoot';

export function getTypesRoot() {
  return path.dirname(resolveImportPath('@cpany/types/package.json', true));
}

export function getAppRoot() {
  return path.dirname(resolveImportPath('@cpany/app/package.json', true));
}

export async function resolveOptions(
  option: ICliOption,
  mode: 'dev' | 'prod'
): Promise<InlineConfig> {
  const appPath = getAppRoot();
  const typesPath = getTypesRoot();
  const deps = JSON.parse(readFileSync(path.join(appPath, 'package.json'), 'utf-8')).dependencies;

  const dataPath = path.resolve(option.data);
  const pluginOption = {
    appRootPath: appPath,
    dataRootPath: dataPath,
    cliVersion: version
  };

  const common: InlineConfig = {
    configFile: false,
    root: appPath,
    envDir: path.resolve(__dirname, '../'),
    plugins: [vue(), WindiCSS(), Icons(), await createCPanyPlugin(pluginOption)],
    resolve: {
      alias: {
        '@cpany/types': typesPath,
        '@': path.resolve(appPath, 'src')
      }
    },
    json: {
      namedExports: false,
      stringify: true
    },
    optimizeDeps: {
      include: Object.keys(deps)
    }
  };

  if (isInstalledGlobally) {
    common.cacheDir = path.join(appPath, 'node_modules/.vite');
    // @ts-expect-error
    injection.resolve.alias.vue = `${resolveImportPath('vue/dist/vue.esm-browser.js', true)}`;
  }

  if (mode === 'dev') {
    return mergeConfig(common, <InlineConfig>{
      define: {
        __DEV__: true
      },
      plugins: [Compress({ enable: false })],
      server: {
        port: option.port,
        host: option.host,
        force: option.force,
        open: option.open,
        fs: {
          strict: true,
          allow: uniq([searchForWorkspaceRoot(appPath), ...(isInstalledGlobally ? [appPath] : [])])
        }
      }
    });
  } else {
    return mergeConfig(common, <InlineConfig>{
      define: {
        __DEV__: false
      },
      plugins: [Compress({ enable: true })],
      build: {
        outDir: path.resolve(option.outDir),
        emptyOutDir: option.emptyOutDir,
        chunkSizeWarningLimit: 1024
      }
    });
  }
}
