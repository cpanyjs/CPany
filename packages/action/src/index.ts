import * as core from '@actions/core';
import { readFileSync, writeFileSync } from 'fs';
import { load } from 'js-yaml';

import { createInstance } from '@cpany/core';
import { codeforcesPlugin } from '@cpany/codeforces';
import { exec } from '@actions/exec';

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content) as any;
}

async function run() {
  const configPath = core.getInput('config');
  const config = await getConfig(configPath);
  core.info(JSON.stringify(config, null, 2));

  const instance = createInstance({ plugins: [...codeforcesPlugin()] });

  const files: string[] = [];

  for (const user of config?.users ?? []) {
    for (const handle of user.handles) {
      const result = await instance.transform({
        id: handle,
        type: 'codeforces/handle'
      });
      if (result !== null) {
        core.info(`Fetch codeforces/handle/${handle}`);
        const { content } = result;
        files.push(handle);
        writeFileSync(handle, content, 'utf8');
      }
    }
  }

  await exec('git', ['add', ...files]);
  await exec('git', ['push']);
}

run();
