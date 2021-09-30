import path from 'path';
import fs from 'fs';
import isInstalledGlobally from 'is-installed-globally';
import { InlineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';

import Compress from '@cpany/compress';
import { uniq } from '@cpany/utils';

import type { ICliOption } from './types';
import { resolveImportPath, slash } from './utils';
import { createCPanyPlugin } from './plugin';
import { version } from './version';
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
  const deps = JSON.parse(
    fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8')
  ).dependencies;

  const dataPath = path.resolve(option.data);
  const pluginOption = {
    appRootPath: appPath,
    dataRootPath: dataPath,
    cliVersion: version
  };

  if (!fs.existsSync(path.join(dataPath, 'cpany.yml'))) {
    throw new Error(`Can not find cpany.yml in ${dataPath}`);
  }

  const common: InlineConfig = {
    root: appPath,
    configFile: false,
    envDir: path.resolve(__dirname, '../'),
    plugins: [
      vue(),
      WindiCSS({
        configFiles: [path.join(appPath, 'windi.config.js')],
        onOptionsResolved(config) {
          config.scanOptions.include.push(`${slash(path.resolve(appPath, 'src/**/*.{vue,ts}'))}`);
        }
      }),
      Icons(),
      await createCPanyPlugin(pluginOption),
      Compress({ enable: mode !== 'dev' })
    ],
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
    },
    logLevel: 'silent'
  };

  if (isInstalledGlobally) {
    common.cacheDir = path.join(dataPath, 'node_modules/.vite');
    // @ts-expect-error
    common.resolve.alias.vue = `${resolveImportPath('vue/dist/vue.esm-browser.js', true)}`;
  }

  if (mode === 'dev') {
    return mergeConfig(common, <InlineConfig>{
      define: {
        __DEV__: true
      },
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
      build: {
        outDir: path.resolve(option.outDir),
        emptyOutDir: option.emptyOutDir,
        chunkSizeWarningLimit: 1024
      }
    });
  }
}
