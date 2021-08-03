import * as core from '@actions/core';
import { hello } from '@cpany/core';

async function run() {
  hello();
  core.info('This is an action');
}

run();
