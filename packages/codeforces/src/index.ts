import axios from 'axios';

import type { CPanyPlugin } from '@cpany/core';
import type { ICPanyPluginConfig } from '@cpany/types';

import { codeforces } from './constant';
import { handleInfoPlugin } from './handle';
import { loadCodeforcesPlugin } from './load';
import { contestListPlugin, gymContestListPlugin } from './contest';

export * from './constant';

export function codeforcesPlugin(option: ICPanyPluginConfig): CPanyPlugin[] {
  const api = axios.create({
    baseURL: option.baseUrl ?? 'https://codeforces.com/api/',
    timeout: 30 * 1000
  });

  return [
    contestListPlugin(api),
    gymContestListPlugin(api),
    handleInfoPlugin(api),
    codeforcesCleanPlugin(),
    loadCodeforcesPlugin()
  ];
}

export default codeforcesPlugin;

function codeforcesCleanPlugin(): CPanyPlugin {
  return {
    name: 'cache',
    platform: codeforces,
    async cache(ctx) {
      const files = await ctx.listDir('handle');
      for (const file of files) {
        await ctx.removeFile(file);
      }
    }
  };
}
