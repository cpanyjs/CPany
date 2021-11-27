import debug from 'debug';
import * as core from '@actions/core';

import type { ResolvedCPanyOption } from '@cpany/types';
import { createCPany as createCPanyInstance, CPanyPlugin } from '@cpany/core';
import { isDef, uniq } from '@cpany/utils';

import { resolveCPanyPlugin } from './utils';
import { ICliOption } from './types';

const debugCLI = debug('cpany:cli');

export const isGithubActions = testGithubActions();

export async function createCPany(option: ICliOption) {
  return createCPanyInstance({
    plugins: await getPluginSet(option.plugins, option.option),
    logger: isGithubActions ? core : undefined,
    logLevel: option.log
  });
}

async function getPluginSet(
  plugins: string[],
  option: ResolvedCPanyOption
): Promise<Array<CPanyPlugin | CPanyPlugin[]>> {
  debugCLI(`plugins: ${plugins.join(', ')}`);

  const resolvedPlugins: Array<CPanyPlugin | CPanyPlugin[]> = [];
  for (const pluginName of uniq(plugins)) {
    const pluginDir = resolveCPanyPlugin(pluginName);
    if (!!pluginDir) {
      debugCLI(`import plugin ${pluginName} => ${pluginDir.directory}`);
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
