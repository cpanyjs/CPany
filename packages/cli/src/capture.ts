import execa from 'execa';
import isInstalledGlobally from 'is-installed-globally';
import { bold, cyan, dim, yellow, green } from 'kolorist';
import ora from 'ora-classic';

import { version } from './version';
import type { ICliExportOption } from './types';

const okMark = '\x1b[32m✓\x1b[0m';
const failMark = '\x1b[31m✖\x1b[0m';

export async function capture(port: number, option: ICliExportOption): Promise<void> {
  const page = option.page.replace(/^\//, '');
  const filename = option.out.endsWith('.' + option.type)
    ? option.out
    : option.out + '.' + option.type;

  console.log();
  console.log(
    `${bold('  CPany')} ${cyan(`v${version}`)} ${isInstalledGlobally ? yellow('(global)') : ''}`
  );
  console.log();
  console.log(`${dim('  Data  ')} ${green(option.data)}`);
  console.log(`${dim('  Page  ')} ${green('/' + page)}`);

  const url = `http://localhost:${port}/${page}`;
  const style = [
    'html, body {',
    `  font-family: 'wqy microhei', apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;`,
    '}',
  ].join(' ');

  const spinner = ora(`${dim('Image ')} ${green(filename)}`).start();

  try {
    await execa('npx', [
      'capture-website',
      url,
      '--full-page',
      '--no-default-background',
      '--style',
      `"${style}"`,
      '--delay',
      '1',
      '--type',
      option.type,
      '--overwrite',
      '--output',
      filename
    ]);
    spinner.stopAndPersist({ symbol: okMark });
  } catch (err) {
    spinner.stopAndPersist({ symbol: failMark });
    console.log();
    console.error(err);
  }
}
