import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'js-yaml';

import type { ICPanyConfig } from '@cpany/types';
import { createInstance } from '@cpany/core';
import { codeforcesPlugin } from '@cpany/codeforces';
import { hduPlugin } from '@cpany/hdu';
import { luoguPlugin } from '@cpany/luogu';

import { createGitFileSystem } from './fs';
import { processReport } from './report';
import { now } from './utils';
import { createRetryContainer } from './retry';

export interface IRunOption {
  logger?: boolean;
  basePath?: string;
  disableGit?: boolean;
  plugins?: string[];
  configPath: string;
  maxRetry: number;
}

export async function run({
  logger = true,
  basePath = './',
  disableGit,
  plugins = ['codeforces', 'hdu'],
  configPath,
  maxRetry
}: IRunOption) {
  const usedPluginSet = new Set(plugins);
  const config = await getConfig(resolve(basePath, configPath));

  const instance = createInstance({
    plugins: [
      usedPluginSet.has('codeforces') ? codeforcesPlugin({ basePath, ...config }) : undefined,
      usedPluginSet.has('hdu') ? await hduPlugin({ basePath, ...config }) : undefined,
      usedPluginSet.has('luogu') ? await luoguPlugin({ basePath, ...config }) : undefined
    ],
    logger: logger ? core : undefined,
    config
  });

  const fs = await createGitFileSystem(basePath, {
    disable: disableGit
  });

  instance.logger.startGroup('Load CPany config');
  instance.logger.info(JSON.stringify(config, null, 2));
  instance.logger.endGroup();

  // clean cache
  instance.logger.startGroup('Clean cache');
  for (const plugin of usedPluginSet) {
    const rawFiles = await instance.load(plugin + '/clean');
    if (!!rawFiles) {
      const files: string[] = JSON.parse(rawFiles.content);
      for (const file of files) {
        await fs.rm(file);
        instance.logger.info(`Remove: ${file}`);
      }
    }
  }
  instance.logger.endGroup();

  instance.logger.startGroup('Fetch data');

  const configFetch = config?.fetch ?? [];
  for (const id of configFetch) {
    const result = await instance.load(id);

    if (!!result) {
      const { key, content } = result;
      await fs.add(key, content);
    }
  }

  const retry = createRetryContainer(maxRetry);
  const configUser = config?.users ?? {};
  for (const userKey in configUser) {
    const user = configUser[userKey];

    for (const type in user) {
      const rawHandles = user[type];
      const handles = typeof rawHandles === 'string' ? [rawHandles] : rawHandles;

      for (const handle of handles) {
        const fn = async () => {
          const result = await instance.transform({
            id: handle,
            type
          });

          if (!!result) {
            const { key, content } = result;
            await fs.add(key, content);
            return true;
          } else if (result === null) {
            // fetch fail
            return false;
          } else {
            // no matching plugin
            return true;
          }
        };
        retry.add(`(id: "${handle}", type: "${type}")`, fn);
      }
    }
  }

  await retry.run();

  instance.logger.endGroup();

  const nowTime = now();
  try {
    await processReport(basePath, nowTime);
  } catch (error) {
    instance.logger.error(error as string);
  }
  await fs.push(nowTime.format('YYYY-MM-DD HH:mm'));
}

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content) as ICPanyConfig;
}
