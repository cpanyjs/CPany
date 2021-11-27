import axios from 'axios';

import type { CPanyPlugin } from '@cpany/core';
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';
import { ICPanyPluginConfig, IContest, isAtCoder } from '@cpany/types';

import { atcoder } from './constant';
import { createAtCoderHandlePlugin } from './handle';
import { addContests, createAtCoderContestPlugin } from './contest';

function loadCookie(): string {
  const session = process.env.REVEL_SESSION;
  if (!session) {
    console.error('Please set env variable REVEL_SESSION !');
    process.exit(1);
  }
  return session!;
}

export function atcoderPlugin(config: ICPanyPluginConfig): CPanyPlugin[] {
  const handleMap = loadHandleMap(config);

  const cookie = loadCookie();

  const api = axios.create({
    baseURL: 'https://atcoder.jp/',
    headers: {
      Cookie: `REVEL_FLASH=; REVEL_SESSION=${cookie}`
    }
  });

  return [
    createAtCoderHandlePlugin(api),
    createAtCoderContestPlugin(api, handleMap),
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
        for (const contest of contests) {
          ctx.addContest(contest);
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
