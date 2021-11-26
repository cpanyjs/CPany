import format from 'date-fns/format';

import type { LogLevel } from '@cpany/types';
import { createRetryContainer } from '@cpany/core';

import { now } from '../utils';
import { ICliOption } from '../types';
import { createCPany, isGithubActions } from '../cpany';

import { processReport } from './report';
import { createGitFileSystem } from './fs';

export interface IRunOption {
  logLevel?: LogLevel;
  basePath?: string;
  plugins?: string[];
  maxRetry: number;
}

export async function run(option: ICliOption) {
  const { instance } = await createCPany(option);

  const fs = await createGitFileSystem(option.dataRoot, {
    disable: !isGithubActions
  });

  instance.logger.startGroup('Load CPany config');
  instance.logger.info(JSON.stringify(option, null, 2));
  instance.logger.endGroup();

  // clean cache
  instance.logger.startGroup('Clean cache');
  for (const file of (await instance.clean()).files) {
    await fs.rm(file);
    instance.logger.info(`Remove: ${file}`);
  }
  instance.logger.endGroup();

  instance.logger.startGroup('Fetch data');

  const retry = createRetryContainer(instance.logger, option.maxRetry);

  for (const username in option.option.users) {
    const user = option.option.users[username];

    for (const handle of user.handle) {
      const fn = async () => {
        const result = await instance.transform({
          id: handle.handle,
          type: handle.platform
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
      retry.add(`(id: "${handle}", platform: "${handle.platform}")`, fn);
    }
  }

  await retry.run();

  // Todo: Support fetch
  // for (const id of config.fetch) {
  //   const result = await instance.load(id);

  //   if (!!result) {
  //     const { key, content } = result;
  //     await fs.add(key, content);
  //   }
  // }

  instance.logger.endGroup();

  const nowTime = now();
  try {
    await processReport(option.dataRoot, nowTime);
  } catch (error) {
    instance.logger.error(error as string);
  }
  await fs.push(format(nowTime, 'yyyy-MM-dd HH:mm'));
}
