import { spawn } from 'child_process';
import isInstalledGlobally from 'is-installed-globally';
import { bold, cyan, dim, yellow, green } from 'kolorist';
import ora from 'ora-classic';

import { version } from './version';
import type { ICliExportOption } from './types';

const okMark = '\x1b[32m✓\x1b[0m';
const failMark = '\x1b[31m✖\x1b[0m';

export function capture(port: number, option: ICliExportOption): Promise<void> {
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

  const spinner = ora(`${dim('Image ')} ${green(filename)}`).start();

  const url = `http://localhost:${port}/${page}`;

  return new Promise((res, rej) => {
    const subprocess = spawn('npx', [
      'capture-website',
      url,
      '--full-page',
      '--no-default-background',
      '--overwrite',
      '--style',
      'html, body { background-color: white; }',
      '--delay',
      '1',
      '--type',
      option.type,
      '--output',
      filename
    ]);
    subprocess.stderr.on('data', (chunk) => {
      spinner.stopAndPersist({ symbol: failMark });
      console.log();
      console.error(`${chunk}`);
    });
    subprocess.on('close', (code) => {
      if (code === 0) {
        spinner.stopAndPersist({ symbol: okMark });
        res();
      } else {
        spinner.stopAndPersist({ symbol: failMark });
        rej();
      }
    });
  });
}
