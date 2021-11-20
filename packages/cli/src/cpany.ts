import { readFileSync } from 'fs';
import { resolve } from 'path';
import debug from 'debug';
import { load } from 'js-yaml';
import * as core from '@actions/core';

import type { ICPanyConfig, ICPanyPluginConfig, LogLevel } from '@cpany/types';
import { createInstance, IPlugin } from '@cpany/core';
import { isDef, isUndef, uniq } from '@cpany/utils';

import { resolveCPanyPlugin } from './utils';

const debugCPany = debug('CPany');

export const isGithubActions = testGithubActions();

export async function createCPany(
  basePath: string,
  plugins: string[],
  logLevel: LogLevel = 'warn'
) {
  const config = await getConfig(basePath);

  const instance = createInstance({
    plugins: await getPluginSet(plugins, config),
    logger: isGithubActions ? core : undefined,
    logLevel
  });

  return { config, instance };
}

async function getPluginSet(
  plugins: string[],
  config: ICPanyPluginConfig
): Promise<Array<IPlugin | IPlugin[]>> {
  const resolvedPlugins: Array<IPlugin | IPlugin[]> = [];
  for (const pluginName of uniq(plugins)) {
    const pluginDir = resolveCPanyPlugin(pluginName);
    if (!!pluginDir) {
      debugCPany(`Plugin [${pluginName}] => ${pluginDir}`);
      const pluginModule = await import(pluginDir.directory);
      const plugin = await pluginModule.default(config);
      resolvedPlugins.push(plugin);
    } else {
      // log error
    }
  }
  return resolvedPlugins;
}

async function getConfig(basePath: string, filename = 'cpany.yml'): Promise<ICPanyPluginConfig> {
  try {
    const path = resolve(basePath, filename);
    const content = readFileSync(path, 'utf8');
    const config = load(content) as ICPanyConfig;

    const transform = (pathes: string[]) => {
      return pathes.map((path) => resolve(basePath, path));
    };

    if (isUndef(config.users)) {
      config.users = {};
    }

    if (isUndef(config.handles)) {
      config.handles = [];
    } else {
      config.handles = transform(config.handles);
    }

    if (isUndef(config.contests)) {
      config.contests = [];
    } else {
      config.contests = transform(config.contests);
    }

    if (isUndef(config.fetch)) {
      config.fetch = [];
    }

    if (isUndef(config.static)) {
      config.static = [];
    } else {
      config.static = transform(config.fetch);
    }

    return { ...config, basePath } as ICPanyPluginConfig;
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
}

function testGithubActions() {
  const flag = process.env['GITHUB_ACTIONS'];
  return isDef(flag) && flag === 'true';
}
