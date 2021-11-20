import os from 'os';
import path from 'path';
import readline from 'readline';
import { createServer, build, ViteDevServer } from 'vite';
import { cac } from 'cac';
import openBrowser from 'open';
import isInstalledGlobally from 'is-installed-globally';
import { blue, bold, cyan, dim, yellow, green, underline } from 'kolorist';

import { run as runAction } from './fetch';

import type { ICliOption, ICliActionOption, ICliExportOption } from './types';
import { version } from './utils';
import { resolveOptions } from './options';
import { findFreePort, resolveImportPath } from './utils';
import { capture } from './capture';

const cli = cac('cpany').option('-p, --plugins <string>', 'CPany plugins', {
  default: 'codeforces,hdu'
});

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
  .action(async (dataPath: string | undefined, option: ICliOption) => {
    await build(await resolveOptions(dataPath, option, 'build'));
  });

cli
  .command('dev [data]', 'Start CPany dev server')
  .option('--host [host]', 'specify hostname')
  .option('--port <port>', 'port to listen to', { default: 3000 })
  .option('--open', 'open browser on startup', { default: false })
  .option('--force', 'force the optimizer to ignore the cache and re-bundle', {
    default: false
  })
  .option('--clear-screen', `allow/disable clear screen`, { default: true })
  .action(async (dataPath: string | undefined, option: ICliOption) => {
    option.data = dataPath ?? './';
    const port = (option.port = await findFreePort(option.port));

    let server: ViteDevServer | undefined = undefined;

    const bootstrap = async () => {
      server = await createServer(await resolveOptions(dataPath, option, 'dev'));
      await server.listen(port);
      if (!!option.clearScreen) console.clear();
      printDevInfo(path.resolve(option.data), port, option.host);
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

    option.page = typeof option.page === 'boolean' ? '/' : option.page;
    const port = (option.port = await findFreePort(option.port));

    try {
      // Open exported image, not website
      let server = await createServer(
        await resolveOptions(dataPath, { ...option, open: false }, 'dev')
      );
      await server.listen(port);
      await capture(port, option);
      await server.close();
    } catch (err) {
      process.exit(1);
    }
  });

cli
  .command('fetch [data]', 'Run @cpany/action locally')
  .option('--log <level>', 'warn | error | silent', { default: 'warn' })
  .option('--max-retry <number>', 'CPany max retry times', { default: 10 })
  .action(
    async (
      dataPath: string | undefined,
      { maxRetry, log, plugins: _plugins }: ICliActionOption
    ) => {
      const plugins = _plugins
        .split(/,| /)
        .map((plugin) => plugin.trim().toLowerCase())
        .filter((plugin) => !!plugin && plugin !== '');

      await runAction({
        logger: false,
        logLevel: log,
        basePath: dataPath,
        disableGit: true,
        maxRetry,
        plugins
      });
    }
  );

cli.help();

cli.version(version);

cli.parse();

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
