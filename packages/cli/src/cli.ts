#!/usr/bin/env node

import { cac } from 'cac';
import { createServer, build } from 'vite';

import { run as runAction } from '@cpany/action';

import type { ICliActionOption, ICliOption } from './types';
import { version } from './version';
import { resolveOptions } from './options';

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
    const server = await createServer(await resolveOptions(option, 'dev'));

    await server.listen();
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
      configPath: 'cpany.yml',
      maxRetry,
      plugins
    });
  });

cli.help();

cli.version(version);

cli.parse();
