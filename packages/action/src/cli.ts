import * as core from '@actions/core';

import { run } from './action';

run({
  disableGit: false,
  configPath: core.getInput('config'),
  maxRetry: +core.getInput('max-retry')
});
