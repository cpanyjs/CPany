import os from 'os';
import path from 'path';
import { createServer, build } from 'vite';
import { cac } from 'cac';
import isInstalledGlobally from 'is-installed-globally';
import { blue, bold, cyan, dim, yellow, green } from 'kolorist';

import { run as runAction } from '@cpany/action';

import type { ICliActionOption, ICliOption } from './types';
import { version } from './version';
import { resolveOptions } from './options';
import { findFreePort } from './utils';

const cli = cac('cpany').option('--data <dir>', 'data directory', { default: '.' });

cli
  .command('', 'Build CPany site')
  .alias('build')
  .option('--emptyOutDir', "force empty outDir when it's outside of root", {
    default: false
  })
  .option('--outDir <dir>', 'output directory', { default: 'dist' })
  .action(async (option: ICliOption) => {
    await build(await resolveOptions(option, 'prod'));
  });

cli
  .command('dev', 'Start CPany dev server')
  .option('--host [host]', 'specify hostname')
  .option('--port <port>', 'port to listen to', { default: 3000 })
  .option('--open', 'open browser on startup', { default: false })
  .option('--force', 'force the optimizer to ignore the cache and re-bundle', {
    default: false
  })
  .action(async (option: ICliOption) => {
    const port = (option.port = await findFreePort(option.port));

    const server = await createServer(await resolveOptions(option, 'dev'));

    await server.listen(port);

    printDevInfo(path.resolve(option.data), port, option.host);
  });

cli
  .command('action <basePath>', 'Run @cpany/action locally')
  .option('--max-retry <number>', 'CPany max retry times', { default: 10 })
  .option('--plugins <string>', 'CPany plugins', { default: 'codeforces,hdu' })
  .action(async (basePath: string, { maxRetry, plugins: _plugins }: ICliActionOption) => {
    const plugins = _plugins
      .split(',')
      .map((plugin) => plugin.trim().toLowerCase())
      .filter((plugin) => plugin !== undefined && plugin !== null && plugin !== '');

    await runAction({
      logger: false,
      basePath,
      disableGit: true,
      maxRetry,
      plugins
    });
  });

cli.help();

cli.version(version);

cli.parse();

function printDevInfo(dataPath: string, port: number, host?: string | boolean) {
  console.log();
  console.log(
    `${bold('  CPany ')} ${cyan(`v${version}`)} ${isInstalledGlobally ? yellow('(global)') : ''}`
  );
  console.log();
  console.log(`${dim('  Data  ')} ${green(dataPath)}`);

  if (port) {
    console.log();
    console.log(`${dim('  Local ')} > ${cyan(`http://localhost:${bold(port)}/`)}`);

    if (host) {
      Object.values(os.networkInterfaces()).forEach((v) =>
        (v || [])
          .filter((details) => details.family === 'IPv4' && !details.address.includes('127.0.0.1'))
          .forEach(({ address }) => {
            console.log(`${dim('  Remote')} > ${blue(`http://${address}:${port}/`)}`);
          })
      );
    } else {
      console.log(`${dim('  Remote')} > ${dim('pass --host to enable')}`);
    }
  }
  console.log();
}
