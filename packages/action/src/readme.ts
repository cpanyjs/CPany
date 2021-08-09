import { promises } from 'fs';
import type { Dayjs } from 'dayjs';

export async function processReadme(time: Dayjs) {
  const content = await promises.readFile('README.md', 'utf8');

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
