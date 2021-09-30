import path from 'path';
import { InlineConfig, mergeConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import WindiCSS from 'vite-plugin-windicss';
import Icons from 'unplugin-icons/vite';
import Compress from '@cpany/compress';

import type { ICliOption } from './types';
import { resolveImportPath } from './utils';
import { createCPanyPlugin } from './plugin';
import { version } from './version'

export function getTypesRoot() {
  return path.dirname(resolveImportPath('@cpany/types/package.json', true));
}

export function getAppRoot() {
  return path.dirname(resolveImportPath('@cpany/app/package.json', true));
}

export async function resolveOptions(option: ICliOption, mode: 'dev' | 'prod'): Promise<InlineConfig> {
  const appPath = getAppRoot();
  const typesPath = getTypesRoot();

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
    plugins: [
      vue(),
      WindiCSS(),
      Icons(),
      await createCPanyPlugin(pluginOption),
      Compress({ enable: true })
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
    }
  };

  if (mode === 'dev') {
    return mergeConfig(common, {
      define: {
        __DEV__: true
      },
      plugins: [
        Compress({ enable: false })
      ],
      server: {
        port: option.port,
        host: option.host,
        force: option.force,
        open: option.open
      }
    });
  } else {
    return mergeConfig(common, {
      define: {
        __DEV__: false
      },
      plugins: [
        Compress({ enable: true })
      ],
      build: {
        outDir: path.resolve(option.outDir),
        emptyOutDir: option.emptyOutDir,
        chunkSizeWarningLimit: 1024
      }
    });
  }
}