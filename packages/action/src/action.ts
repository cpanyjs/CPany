import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { load } from 'js-yaml';

import type { ICPanyConfig } from '@cpany/types';
import { createInstance } from '@cpany/core';
import { codeforcesPlugin } from '@cpany/codeforces';
import { hduPlugin } from '@cpany/hdu';

import { createGitFileSystem } from './fs';
import { processReport } from './report';
import { now } from './utils';
import { createRetryContainer } from './retry';

export interface IRunOption {
  basePath?: string;
  disableGit?: boolean;
  configPath: string;
  maxRetry: number;
}

export async function run({
  basePath = './',
  disableGit,
  configPath,
  maxRetry
}: IRunOption) {
  core.startGroup('Load CPany config');
  const config = await getConfig(resolve(basePath, configPath));
  core.info(JSON.stringify(config, null, 2));
  core.endGroup();

  const instance = createInstance({
    plugins: [
      ...codeforcesPlugin(),
      ...(await hduPlugin({ basePath, ...config }))
    ],
    logger: core
  });

  const fs = await createGitFileSystem(basePath, {
    disable: disableGit,
    skipList: new Set([
      'README.md',
      'netlify.toml',
      'package.json',
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'LICENSE',
      'LICENCE',
      'node_modules',
      configPath,
      ...(config?.static ?? [])
    ])
  });

  core.startGroup('Fetch data');

  const configFetch = config?.fetch ?? [];
  for (const id of configFetch) {
    const result = await instance.load(id);

    if (result !== null) {
      core.info(`Fetched ${id}`);
      const { key, content } = result;
      await fs.add(key, content);
    } else {
      core.error(`Fetch "${id}" fail`);
    }
  }

  const retry = createRetryContainer(maxRetry);
  const configUser = config?.users ?? {};
  for (const userKey in configUser) {
    const user = configUser[userKey];

    for (const type in user) {
      const rawHandles = user[type];
      const handles =
        typeof rawHandles === 'string' ? [rawHandles] : rawHandles;

      for (const handle of handles) {
        const fn = async () => {
          const result = await instance.transform({
            id: handle,
            type
          });

          if (result !== null) {
            core.info(`Fetched ${result.key}`);
            const { key, content } = result;
            await fs.add(key, content);
            return true;
          } else {
            core.error(`Fetch (id: "${handle}", type: "${type}") fail`);
            return false;
          }
        };
        retry.add(`(id: "${handle}", type: "${type}")`, fn);
      }
    }
  }

  await retry.run();

  core.endGroup();

  const nowTime = now();
  await processReport(basePath, nowTime);
  await fs.push(nowTime.format('YYYY-MM-DD HH:mm'));
}

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content) as ICPanyConfig;
}
