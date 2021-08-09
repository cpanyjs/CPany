import { promises } from 'fs';

export async function processReadme(time: string) {
  const content = await promises.readFile('README.md', 'utf8');

  const newContent = content.replace(
    /<!-- START_SECTION: update_time -->([\s\S]*)<!-- END_SECTION: update_time -->/,
    `\n更新时间：${time}\n`
  );

  await promises.writeFile('README.md', newContent, 'utf8');
}
