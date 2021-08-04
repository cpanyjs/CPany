import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

import { createInstance } from '@cpany/core';
import { codeforcesPlugin } from '@cpany/codeforces';
import { createGitFileSystem } from './fs';

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content) as any;
}

async function run() {
  const configPath = core.getInput('config');
  const config = await getConfig(configPath);
  core.info(JSON.stringify(config, null, 2));

  const instance = createInstance({ plugins: [...codeforcesPlugin()] });

  const fs = await createGitFileSystem('/');

  for (const id of config?.static ?? []) {
    const result = await instance.load(id);
    if (result !== null) {
      core.info(`Fetch ${id}`);
      const { key, content } = result;
      await fs.add(key, content);
    }
  }

  for (const user of config?.users ?? []) {
    for (const handle of user.handles) {
      const result = await instance.transform({
        id: handle,
        type: 'codeforces/handle'
      });
      if (result !== null) {
        core.info(`Fetch codeforces/handle/${handle}`);
        const { key, content } = result;
        await fs.add(key, content);
      }
    }
  }

  await fs.push();
}

run();
