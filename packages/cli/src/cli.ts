import os from 'os';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { createServer, build, ViteDevServer } from 'vite';
import { cac } from 'cac';
import { debug } from 'debug';
import { load } from 'js-yaml';
import openBrowser from 'open';
import { blue, bold, cyan, dim, yellow, green, lightRed, underline } from 'kolorist';
import isInstalledGlobally from 'is-installed-globally';

import { CPanyOption } from '@cpany/types';
import { resolveCPanyOption } from '@cpany/core';

import type { ICliOption, ICliExportOption } from './types';
import { capture } from './capture';
import { run as runAction } from './fetch';
import { resolveViteOptions } from './options';
import { findFreePort, resolveImportPath, version } from './utils';

const cli = cac('cpany')
  .option('-p, --plugin [...plugins]', 'CPany plugins')
  .option('--log <level>', 'warn | error | silent', { default: 'warn' });

function resolveOption(dataPath: string | undefined, option: ICliOption) {
  option.dataRoot = dataPath ?? process.cwd();

  if (!fs.existsSync(path.join(option.dataRoot, 'cpany.yml'))) {
    throw new Error(`Can not find cpany.yml in ${dataPath}`);
  }

  const optionPath = path.resolve(option.dataRoot, 'cpany.yml');
  const content = fs.readFileSync(optionPath, 'utf8');
  const cpanyOption = load(content) as CPanyOption;

  option.option = resolveCPanyOption(option.dataRoot, cpanyOption);

  // Single plugin cli argument
  // @ts-ignore
  if (typeof option.plugin === 'string') {
    // @ts-ignore
    option.plugins = [option.plugin];
  } else {
    // @ts-ignore
    option.plugins = option.plugin;
  }
  if (!option.plugins) {
    option.plugins = cpanyOption.plugins ?? ['codeforces'];
  }

  // @ts-ignore
  delete option['plugin'];
  // @ts-ignore
  delete option['p'];
  // @ts-ignore
  delete option['--'];

  debug('cpany:cli')(option);
}

cli
  .command('[data]', 'Build CPany site')
  .alias('build')
  .option('--emptyOutDir', "force empty outDir when it's outside of root", {
    default: false
  })
  .option('--outDir <dir>', 'output directory', { default: 'dist' })
  .option('--force', 'force the optimizer to ignore the cache and re-bundle', {
    default: false
  })
  .option('--base <path>', `public base path`, { default: '/' })
  .action(async (dataPath: string | undefined, option: ICliOption) => {
    resolveOption(dataPath, option);

    await build(await resolveViteOptions(option, 'build'));
  });

cli
  .command('dev [data]', 'Start CPany dev server')
  .option('--host [host]', 'specify hostname')
  .option('--port <port>', 'port to listen to', { default: 3000 })
  .option('--open', 'open browser on startup', { default: false })
  .option('--force', 'force the optimizer to ignore the cache and re-bundle', {
    default: false
  })
  .option('--clear-screen', `allow/disable clear screen`, { default: false })
  .action(async (dataPath: string | undefined, option: ICliOption) => {
    resolveOption(dataPath, option);

    const port = (option.port = await findFreePort(option.port));

    let server: ViteDevServer | undefined = undefined;

    const bootstrap = async () => {
      server = await createServer(await resolveViteOptions(option, 'dev'));
      await server.listen(port);
      if (!!option.clearScreen) console.clear();
      printDevInfo(path.resolve(option.dataRoot), port, option.host);
    };

    const SHORTCUTS = [
      {
        name: 'r',
        fullname: 'restart',
        async action() {
          if (server) {
            const oldServer = server;
            server = undefined;
            await oldServer.close();
          }
          await bootstrap();
        }
      },
      {
        name: 'o',
        fullname: 'open',
        async action() {
          openBrowser(`http://localhost:${port}`);
        }
      },
      {
        name: 'q',
        fullname: 'quit',
        async action() {
          process.exit(0);
        }
      }
    ];

    function bindShortcut() {
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
      }
      process.stdin.on('data', async (data) => {
        const str = data.toString().trim().toLowerCase();
        const [sh] = SHORTCUTS.filter((item) => item.name === str || item.fullname === str);
        if (sh) {
          // clear the last line
          try {
            await sh.action();
          } catch (err) {
            console.error(`Failed to execute shortcut ${sh.fullname}`, err);
          }
        }
      });
    }

    await bootstrap();

    bindShortcut();
  });

cli
  .command('export [data]', 'Export CPany pages to Pictures')
  .option('--host [host]', 'specify hostname')
  .option('--port <port>', 'port to listen to', { default: 3000 })
  .option('--force', 'force the optimizer to ignore the cache and re-bundle', {
    default: false
  })
  .option('--open', 'open exported image', { default: false })
  .option('--page [url]', 'page url to be exported', { default: 'members' })
  .option('--out <filename>', 'image filename', { default: 'screenshot' })
  .option('--type <image type>', 'image type: png | jpeg | webp', { default: 'png' })
  .action(async (dataPath: string | undefined, option: ICliExportOption) => {
    if (!resolveImportPath(`capture-website-cli/package.json`)) {
      throw new Error(
        'The exporting for CPany is powered by capture-website-cli, please installed it via `npm i capture-website-cli`'
      );
    }

    resolveOption(dataPath, option);

    option.page = typeof option.page === 'boolean' ? '/' : option.page;
    const port = (option.port = await findFreePort(option.port));

    try {
      // Open exported image, not website
      let server = await createServer(await resolveViteOptions({ ...option, open: false }, 'dev'));
      await server.listen(port);
      await capture(port, option);
      await server.close();
    } catch (err) {
      process.exit(1);
    }
  });

cli
  .command('fetch [data]', 'Fetch data locally')
  .option('--max-retry <number>', 'CPany max retry times', { default: 10 })
  .action(async (dataPath: string | undefined, option: ICliOption) => {
    resolveOption(dataPath, option);

    await runAction(option);
  });

function printDevInfo(dataPath: string, port: number, host?: string | boolean) {
  console.log();
  console.log(
    `${bold('  CPany')} ${cyan(`v${version}`)} ${isInstalledGlobally ? yellow('(global)') : ''}`
  );
  console.log();
  console.log(`${dim('  Data ')} ${green(dataPath)}`);

  if (port) {
    console.log();
    console.log(`${dim('  Local    ')} > ${cyan(`http://localhost:${bold(port)}/`)}`);

    if (host) {
      Object.values(os.networkInterfaces()).forEach((v) =>
        (v || [])
          .filter((details) => details.family === 'IPv4' && !details.address.includes('127.0.0.1'))
          .forEach(({ address }) => {
            console.log(`${dim('  Remote   ')} > ${blue(`http://${address}:${port}/`)}`);
          })
      );
    } else {
      console.log(`${dim('  Remote   ')} > ${dim('pass --host to enable')}`);
    }

    console.log();
    console.log(
      `${dim('  Shortcuts')} > ${underline('r')}${dim('estart | ')}${underline('o')}${dim(
        'pen | '
      )}${underline('q')}${dim('uit')}`
    );
  }

  console.log();
}

cli.help();

cli.version(version);

async function bootstrap() {
  try {
    cli.parse(process.argv, { run: false })
    await cli.runMatchedCommand()
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(lightRed('Error: ') + error.message);
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

bootstrap();
