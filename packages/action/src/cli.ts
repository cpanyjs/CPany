import * as core from '@actions/core';

import type { LogLevel } from '@cpany/types/dist';

import { run } from './action';

const plugins = core
  .getInput('plugins')
  ?.split(',')
  .map((plugin) => plugin.trim().toLowerCase())
  .filter((plugin) => plugin !== undefined && plugin !== null && plugin !== '');

run({
  logLevel: core.getInput('log-level') as LogLevel,
  disableGit: false,
  maxRetry: +core.getInput('max-retry'),
  plugins
});
