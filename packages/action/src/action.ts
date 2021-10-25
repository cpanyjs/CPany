import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'js-yaml';

import type { ICPanyConfig, ICPanyPluginConfig } from '@cpany/types';
import { createInstance, createRetryContainer } from '@cpany/core';
import { isUndef } from '@cpany/utils';

import { codeforcesPlugin } from '@cpany/codeforces';
import { atcoderPlugin } from '@cpany/atcoder';
import { luoguPlugin } from '@cpany/luogu';
import { hduPlugin } from '@cpany/hdu';

import { createGitFileSystem } from './fs';
import { processReport } from './report';
import { now } from './utils';

export interface IRunOption {
  logger?: boolean;
  basePath?: string;
  disableGit?: boolean;
  plugins?: string[];
  maxRetry: number;
}

export async function run({
  logger = true,
  basePath = './',
  disableGit,
  plugins = ['codeforces', 'hdu'],
  maxRetry
}: IRunOption) {
  const activatePlugin = getPluginSet(plugins);
  const config = await getConfig(basePath);

  const instance = createInstance({
    plugins: [
      activatePlugin.codeforces ? codeforcesPlugin(config) : undefined,
      activatePlugin.atcoder ? atcoderPlugin(config) : undefined,
      activatePlugin.hdu ? await hduPlugin(config) : undefined,
      activatePlugin.luogu ? await luoguPlugin(config) : undefined
    ],
    logger: logger ? core : undefined
  });

  const fs = await createGitFileSystem(basePath, {
    disable: disableGit
  });

  instance.logger.startGroup('Load CPany config');
  instance.logger.info(JSON.stringify(config, null, 2));
  instance.logger.endGroup();

  // clean cache
  instance.logger.startGroup('Clean cache');
  for (const file of (await instance.clean()).files) {
    await fs.rm(file);
    instance.logger.info(`Remove: ${file}`);
  }
  instance.logger.endGroup();

  instance.logger.startGroup('Fetch data');

  const retry = createRetryContainer(instance.logger, maxRetry);

  for (const userKey in config.users) {
    const user = config.users[userKey];

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

  for (const id of config.fetch) {
    const result = await instance.load(id);

    if (!!result) {
      const { key, content } = result;
      await fs.add(key, content);
    }
  }

  instance.logger.endGroup();

  const nowTime = now();
  try {
    await processReport(basePath, nowTime);
  } catch (error) {
    instance.logger.error(error as string);
  }
  await fs.push(nowTime.format('YYYY-MM-DD HH:mm'));
}

function getPluginSet(plugins: string[]) {
  const set = new Set(plugins);
  return {
    codeforces: set.has('codeforces') || set.has('cf'),
    atcoder: set.has('atcoder') || set.has('at'),
    hdu: set.has('hdu'),
    luogu: set.has('luogu') || set.has('lg')
  };
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
