import * as core from '@actions/core';
import { readFileSync } from 'fs';
import { load } from 'js-yaml';

import { hello } from '@cpany/core';

async function getConfig(path: string) {
  const content = readFileSync(path, 'utf8');
  return load(content);
}

async function run() {
  hello();
  core.info('This is an action');

  const configPath = core.getInput('config');
  const config = await getConfig(configPath);
  core.info(JSON.stringify(config, null, 2));
}

run();
