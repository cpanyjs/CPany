import { promises } from 'fs';
import { resolve } from 'path';

import format from 'date-fns/format';
import getUnixTime from 'date-fns/getUnixTime'

import { version } from '../version';

export async function processReadme(basePath: string, time: Date) {
  const fullPath = resolve(basePath, 'README.md');

  const content = await promises.readFile(fullPath, 'utf8');

  const newContent = content.replace(
    /<!-- START_SECTION: update_time -->([\s\S]*)<!-- END_SECTION: update_time -->/,
    `<!-- START_SECTION: update_time -->\n更新时间：[${format(time, 
      'yyyy-MM-dd HH:mm'
    )}](https://www.timeanddate.com/worldclock/fixedtime.html?msg=Fetch+data&iso=${format(time,
      'yyyyMMddTHHmmss'
    )}&p1=237)\n<!-- END_SECTION: update_time -->`
  );

  await promises.writeFile(fullPath, newContent, 'utf8');
}

export async function processVersion(basePath: string, time: Date) {
  const content = [`ACTION_VERSION=${version}`, `UPDATE_TIME=${getUnixTime(time)}`];
  await promises.writeFile(resolve(basePath, '.env'), content.join('\n'));
}

export async function processReport(basePath: string, time: Date) {
  let firstError: any | null = null;
  try {
    await processReadme(basePath, time);
  } catch (error) {
    firstError = error;
  }
  try {
    await processVersion(basePath, time);
  } catch (error) {
    if (!firstError) {
      firstError = error;
    }
  }
  if (!!firstError) {
    throw firstError;
  }
}
