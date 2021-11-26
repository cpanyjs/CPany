import debug from 'debug';
import * as core from '@actions/core';

import type { ResolvedCPanyOption } from '@cpany/types';
import { createInstance, IPlugin } from '@cpany/core';
import { isDef, uniq } from '@cpany/utils';

import { resolveCPanyPlugin } from './utils';
import { ICliOption } from './types';

const debugCLI = debug('cpany:cli');

export const isGithubActions = testGithubActions();

export async function createCPany(option: ICliOption) {
  const instance = createInstance({
    plugins: await getPluginSet(option.plugins, option.option),
    logger: isGithubActions ? core : undefined,
    logLevel: option.log
  });

  return { instance };
}

async function getPluginSet(
  plugins: string[],
  option: ResolvedCPanyOption
): Promise<Array<IPlugin | IPlugin[]>> {
  debug('cpany:cli')(`Plugins: ${plugins.join(', ')}`);

  const resolvedPlugins: Array<IPlugin | IPlugin[]> = [];
  for (const pluginName of uniq(plugins)) {
    const pluginDir = resolveCPanyPlugin(pluginName);
    if (!!pluginDir) {
      debugCLI(`Plugin [${pluginName}] => ${pluginDir.directory}`);
      const pluginModule = await import(pluginDir.directory);
      const plugin = await pluginModule.default(option);
      resolvedPlugins.push(plugin);
    } else {
      // log error
    }
  }
  return resolvedPlugins;
}

function testGithubActions() {
  const flag = process.env['GITHUB_ACTIONS'];
  return isDef(flag) && flag === 'true';
}
