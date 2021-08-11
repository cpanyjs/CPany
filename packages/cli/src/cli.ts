#!/usr/bin/env node

import path from 'path';
import { readFileSync } from 'fs';
import { cac } from 'cac';
import { createServer, build } from 'vite';

const cli = cac('cpany');

cli
  .command('dev', 'Start CPany dev server')
  .option('--data <data path>', 'Data path')
  .option('--app <app path>', 'App path')
  .option('--port <port>', 'port to listen to', { default: 3000 })
  .action(async (option) => {
    const server = await createServer({
      root: path.resolve(option.app),
      server: {
        port: option.port
      }
    });
    await server.listen();
  });

cli
  .command('build', 'Build CPany site')
  .option('--data <data path>', 'Data path')
  .option('--app <app path>', 'App path')
  .option('--out <output path>', 'Output path', { default: 'site' })
  .action(async (option) => {
    await build({
      root: path.resolve(option.app),
      build: {
        outDir: path.resolve(option.out)
      }
    });
  });

cli.help();

cli.version(
  JSON.parse(readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'))
    .version
);

cli.parse();
