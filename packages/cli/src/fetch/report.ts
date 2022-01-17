import { promises } from 'fs';
import { resolve } from 'path';

import format from 'date-fns/format';
import getUnixTime from 'date-fns/getUnixTime';

import type { FetchLog, ResolvedCPanyOption } from '@cpany/types';
import type { CPanyInstance } from '@cpany/core';

import { version } from '../utils';

export async function processReadme(basePath: string, time: Date) {
  const fullPath = resolve(basePath, 'README.md');

  const content = await promises.readFile(fullPath, 'utf8');

  const newContent = content.replace(
    /<!-- START_SECTION: update_time -->([\s\S]*)<!-- END_SECTION: update_time -->/,
    `<!-- START_SECTION: update_time -->\n更新时间：[${format(
      time,
      'yyyy-MM-dd HH:mm'
    )}](https://www.timeanddate.com/worldclock/fixedtime.html?msg=Fetch+data&iso=${format(
      time,
      'yyyyMMddTHHmmss'
    )}&p1=237)\n<!-- END_SECTION: update_time -->`
  );

  await promises.writeFile(fullPath, newContent, 'utf8');
}

export async function processLog(option: ResolvedCPanyOption, time: Date, fetcher: CPanyInstance) {
  const history = await fetcher.diff(option);
  const content: FetchLog = {
    version,
    updateTime: getUnixTime(time),
    history
  };
  await promises.writeFile(resolve(option.dataRoot, 'log.json'), JSON.stringify(content, null, 2));
}

export async function processReport(
  option: ResolvedCPanyOption,
  time: Date,
  fetcher: CPanyInstance
) {
  let firstError: any | null = null;
  try {
    await processReadme(option.dataRoot, time);
  } catch (error) {
    firstError = error;
  }
  try {
    await processLog(option, time, fetcher);
  } catch (error) {
    if (!firstError) {
      firstError = error;
    }
  }
  if (!!firstError) {
    throw firstError;
  }
}
