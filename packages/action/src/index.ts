import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

import { createInstance } from '@cpany/core';
import { codeforcesPlugin } from '@cpany/codeforces';

import type { ICPanyConfig } from './type';
import { createGitFileSystem } from './fs';
import { processReadme } from './readme';
import { now } from './utils';

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content) as ICPanyConfig;
}

async function run() {
  core.startGroup('Load CPany config');
  const configPath = core.getInput('config');
  const config = await getConfig(configPath);
  core.info(JSON.stringify(config, null, 2));
  core.endGroup();

  const instance = createInstance({ plugins: [...codeforcesPlugin()] });

  const fs = await createGitFileSystem(
    './',
    new Set([
      'README.md',
      'netlify.toml',
      'package.json',
      'LICENSE',
      'LICENCE',
      configPath,
      core.getInput('skipClean')
    ])
  );

  core.startGroup('Fetch data');

  const configStatic = config?.static ?? [];
  for (const id of configStatic) {
    const result = await instance.load(id);
    if (result !== null) {
      core.info(`Fetched ${id}`);
      const { key, content } = result;
      await fs.add(key, content);
    } else {
      core.error(`Fetch "${id}" fail`);
    }
  }

  const configUser = config?.users ?? {};
  for (const userKey in configUser) {
    const user = configUser[userKey];
    for (const type in user) {
      const handles = user[type];
      for (const handle of handles) {
        const result = await instance.transform({
          id: handle,
          type
        });
        if (result !== null) {
          core.info(`Fetched ${result.key}`);
          const { key, content } = result;
          await fs.add(key, content);
        } else {
          core.error(`Fetch (id: "${handle}", type: "${type}") fail`);
        }
      }
    }
  }

  core.endGroup();

  const nowTime = now();
  await processReadme(nowTime);
  await fs.push(nowTime.format('YYYY-MM-DD HH:mm'));
}

run();
