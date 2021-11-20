import format from 'date-fns/format';

import type { LogLevel } from '@cpany/types';
import { createRetryContainer } from '@cpany/core';

import { createCPany } from '../cpany';

import { createGitFileSystem } from './fs';
import { processReport } from './report';
import { now } from './utils';

export interface IRunOption {
  logLevel?: LogLevel;
  basePath?: string;
  disableGit?: boolean;
  plugins?: string[];
  maxRetry: number;
}

export async function run({
  logLevel = 'warn',
  basePath = './',
  disableGit,
  plugins = ['codeforces', 'hdu'],
  maxRetry
}: IRunOption) {
  const {config, instance} = await createCPany(basePath, plugins, logLevel);

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
  await fs.push(format(nowTime, 'yyyy-MM-dd HH:mm'));
}
