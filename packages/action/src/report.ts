import { promises } from 'fs';
import { resolve } from 'path';
import type { Dayjs } from 'dayjs';
import * as core from '@actions/core';

import { ActionVersion } from './version';

export async function processReadme(basePath: string, time: Dayjs) {
  const content = await promises.readFile(
    resolve(basePath, 'README.md'),
    'utf8'
  );

  const newContent = content.replace(
    /<!-- START_SECTION: update_time -->([\s\S]*)<!-- END_SECTION: update_time -->/,
    `<!-- START_SECTION: update_time -->\n更新时间：[${time.format(
      'YYYY-MM-DD HH:mm'
    )}](https://www.timeanddate.com/worldclock/fixedtime.html?msg=Fetch+data&iso=${time.format(
      'YYYYMMDDTHHmmss'
    )}&p1=237)\n<!-- END_SECTION: update_time -->`
  );

  await promises.writeFile('README.md', newContent, 'utf8');
}

export async function processVersion(basePath: string, time: Dayjs) {
  const content = [
    `ACTION_VERSION=${ActionVersion}`,
    `UPDATE_TIME=${time.unix()}`
  ];
  await promises.writeFile(resolve(basePath, '.env'), content.join('\n'));
}

export async function processReport(basePath: string, time: Dayjs) {
  try {
    await processReadme(basePath, time);
  } catch (error) {
    core.error(error);
  }
  try {
    await processVersion(basePath, time);
  } catch (error) {
    core.error(error);
  }
}