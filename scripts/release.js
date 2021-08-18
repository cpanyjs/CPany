const { join } = require('path');
const { readJSON, writeJSON, writeFile } = require('fs-extra');
const execa = require('execa');

const packages = [
  './packages/action',
  './packages/app',
  './packages/cli',
  './packages/codeforces',
  './packages/core',
  './packages/types'
];

async function run() {
  const version = process.argv[2];
  if (!version || !/^\d+.\d+.\d+/.test(version)) {
    console.error(`Invalid version: ${version}`);
    process.exit(1);
  }
  console.log('Publish @cpany version:', version);
  for (const package of packages) {
    const path = join(package, 'package.json');
    const json = await readJSON(path);
    json.version = version;
    await writeJSON(path, json, { spaces: 2 });
  }
  
  await writeFile('./packages/cli/.env', `VITE_CLI_VERSION=${version}`);
  await writeFile('./packages/action/src/version.ts', `export const ActionVersion = '${version}';`);
  
  await execa('git', ['add', '.'], { stdio: 'inherit' });
  await execa('git', ['commit', '-m', `release: v${version}`], { stdio: 'inherit' });
  await execa('git', ['tag', '-a', `v${version}`, '-m', `release: v${version}`], { stdio: 'inherit' });
}

run();
