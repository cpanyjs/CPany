import type { CPanyPlugin } from '@cpany/core';
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';
import { ICPanyPluginConfig, IContest, isAtCoder } from '@cpany/types';

import { atcoder } from './constant';
import { createAtCoderHandlePlugin } from './handle';
import { addContests, createAtCoderContestPlugin } from './contest';

export function atcoderPlugin(config: ICPanyPluginConfig): CPanyPlugin[] {
  const handleMap = loadHandleMap(config);

  return [
    createAtCoderHandlePlugin(),
    createAtCoderContestPlugin(handleMap),
    {
      name: 'cache',
      platform: atcoder,
      async cache(ctx) {
        const contests: IContest[] = await ctx.readJsonFile('contest.json');
        addContests(contests);

        const handles = await ctx.listDir('handle');
        for (const handle of handles) {
          await ctx.removeFile(handle);
        }
      }
    },
    {
      name: 'load',
      platform: atcoder,
      async load(_option, ctx) {
        const handles = await ctx.readJsonDir<IHandleWithAtCoder>('handle');
        for (const handle of handles) {
          ctx.addHandle(handle);
        }

        const contests = await ctx.readJsonFile<IContest[]>('contest');
        for (const rawContest of contests) {
          const contest = { ...rawContest, key: String(rawContest.id!!) };
          contest.inlinePage = true;
          ctx.addContest(contest);

          for (const standing of contest.standings ?? []) {
            const name = standing.author.teamName!;
            ctx.addUserContest(name, contest, standing.author);
          }
        }
      }
    }
  ];
}

export default atcoderPlugin;

function loadHandleMap(config: ICPanyPluginConfig) {
  const handleMap = new Map<string, string>();
  for (const user of config.users) {
    for (const handle of user.handle) {
      if (isAtCoder({ type: handle.platform })) {
        handleMap.set(handle.handle, user.name);
      }
    }
  }
  return handleMap;
}
