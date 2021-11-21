const { join } = require('path');
const { readJSON, writeJSON, writeFile, readFile } = require('fs-extra');
const execa = require('execa');

const packages = [
  './packages/app',
  './packages/cli',
  './packages/codeforces',
  './packages/hdu',
  './packages/luogu',
  './packages/atcoder',
  './packages/utils',
  './packages/core',
  './packages/types',
  './packages/compress'
];

async function check() {
  const result = await execa('git', ['branch']);
  if (result.stdout.search('main') < 0) {
    console.error(`Please re-run in main branch`);
    process.exit(1);
  }
}

async function run(cmd, ...args) {
  console.log(`$ ${cmd} ${args.join(' ')}`);
  await execa(cmd, args, { stdio: 'inherit' });
  console.log();
}

/**
 * Usage: pnpm run release %d.%d.%d
 */
async function boostrap() {
  await check();

  const version = process.argv[2];

  if (!version || !/^\d+.\d+.\d+/.test(version)) {
    console.error(`Invalid version: ${version}`);
    process.exit(1);
  }

  console.log('Publish @cpany version:', version);
  console.log();

  for (const package of packages) {
    const path = join(package, 'package.json');
    const json = await readJSON(path);
    json.version = version;
    await writeJSON(path, json, { spaces: 2 });
  }

  const readme = (await readFile('./README.md')).toString();
  await writeFile('./README.md', readme);
  await writeFile('./packages/cli/README.md', readme);

  await run('npm', 'run', 'format');
  await run('npm', 'run', 'build');

  await run('git', 'add', '.');
  await run('git', 'commit', '-m', `release: v${version}`);

  await run('git', 'tag', '-a', `v${version}`, '-m', `release: v${version}`);
  await run('git', 'push', 'origin', `:refs/tags/v${version.split('.')[0]}`);
  await run('git', 'tag', '-fa', `v${version.split('.')[0]}`, '-m', `release: v${version}`);
  await run('git', 'push', 'origin', 'main', '--tags');
}

boostrap();
