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
import { createCPanyPlugin } from './plugins';
import { version, resolveImportPath, slash, searchForWorkspaceRoot } from './utils';

export function getTypesRoot() {
  return path.dirname(resolveImportPath('@cpany/types/package.json', __dirname, true));
}

export function getAppRoot() {
  return path.dirname(resolveImportPath('@cpany/app/package.json', __dirname, true));
}

export async function resolveViteOptions(
  option: ICliOption,
  mode: 'dev' | 'build'
): Promise<InlineConfig> {
  option.dev = mode === 'dev';

  const dataPath = option.dataRoot;

  const appPath = getAppRoot();
  const typesPath = getTypesRoot();

  const dependencies = JSON.parse(
    fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8')
  ).dependencies;

  const pluginOption = {
    ...option,
    appRoot: appPath,
    cliVersion: version
  };

  // TODO: fix import
  // const viteInspect = resolveImportPath('vite-plugin-inspect', __dirname, false);

  const common: InlineConfig = {
    root: appPath,
    configFile: false,
    define: {
      __CLI_VERSION__: JSON.stringify(version),
      __GITHUB_REPOSITORY__: JSON.stringify(process.env.GITHUB_REPOSITORY)
    },
    plugins: [
      // viteInspect && (await import(viteInspect)).default(),
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
      include: Object.keys(dependencies)
    }
  };

  if (isInstalledGlobally) {
    common.cacheDir = path.join(dataPath, 'node_modules/.vite');
    // @ts-expect-error
    common.resolve.alias.vue = `${resolveImportPath('vue/dist/vue.esm-browser.js', true)}`;
  }

  if (option.dev) {
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
      },
      json: {
        stringify: false
      },
      logLevel: 'warn'
    });
  } else {
    return mergeConfig(common, <InlineConfig>{
      define: {
        __DEV__: false
      },
      base: option.base,
      build: {
        outDir: path.join(process.cwd(), option.outDir),
        emptyOutDir: option.emptyOutDir,
        chunkSizeWarningLimit: 2048,
        cssCodeSplit: false
      }
    });
  }
}
