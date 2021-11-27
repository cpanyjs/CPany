import type { LoadPlugin } from '@cpany/core';
import type { IContest } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';

import { codeforces } from './constant';

export function loadCodeforcesPlugin(): LoadPlugin {
  return {
    name: 'load',
    platform: codeforces,
    async load(_option, ctx) {
      // Load handles
      const handles = await ctx.readJsonDir<IHandleWithCodeforces>('handle');
      for (const handle of handles) {
        ctx.addHandle(handle);
      }

      // Load contests
      const contests = await ctx.readJsonFile<IContest[]>('contest');
      const gymContests = await ctx.readJsonFile<IContest[]>('gym-contest');
      for (const contest of contests) {
        ctx.addContest(contest);
      }
      for (const contest of gymContests) {
        ctx.addContest(contest);
      }
    }
  };
}
