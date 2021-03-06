import type { CPanyPlugin } from '@cpany/core';
import type { IContest, ICPanyPluginConfig, Key } from '@cpany/types';
import type { IHandleWithNowcoder } from '@cpany/types/nowcoder';

import { nowcoder } from './constant';
import { addContests, contestListPlugin } from './contest';
import { diffNowcoderPlugin } from './diff';
import { addToCache, createHandlePlugin } from './handle';

export function nowocderPlugin(_option: ICPanyPluginConfig): CPanyPlugin[] {
  return [
    {
      name: 'cache',
      platform: nowcoder,
      async cache(ctx) {
        try {
          const contests: IContest[] = await ctx.readJsonFile('contest.json');
          addContests(contests);
        } catch {}
        for (const handle of await ctx.readJsonDir<IHandleWithNowcoder>('handle')) {
          addToCache(handle);
        }
      }
    },
    createHandlePlugin(),
    diffNowcoderPlugin(),
    contestListPlugin(),
    {
      name: 'load',
      platform: nowcoder,
      async load(_option, ctx) {
        const handles = await ctx.readJsonDir<IHandleWithNowcoder>('handle');
        const contests: IContest[] = await ctx.readJsonFile('contest.json');
        const cache = new Map<number | string, Key<IContest>>();
        for (const rawContest of contests) {
          const contest = { ...rawContest, key: String(rawContest.id!!) };
          contest.inlinePage = true;
          cache.set(contest.id!, contest);
          ctx.addContest(contest);
        }
        for (const handle of handles) {
          ctx.addHandle(handle);
          for (const cid of handle.nowcoder.contests) {
            if (cache.get(cid)) {
              const contest = cache.get(cid)!;
              for (const standing of contest.standings ?? []) {
                if (standing.author.members[0] === handle.handle) {
                  const username = ctx.findUsername(nowcoder, handle.handle);
                  standing.author.members[0] = username ?? handle.handle;
                  standing.author.teamName = handle.nowcoder.name;
                  standing.author.teamUrl = handle.handleUrl;
                  if (username) {
                    contest.participantNumber += 1;
                    ctx.addUserContest(
                      username,
                      { ...contest, standings: undefined },
                      standing.author
                    );
                  }
                } else {
                  const team = handle.nowcoder.teams.find(
                    (t) => '' + t.teamId === standing.author.members[0]
                  );
                  if (team) {
                    standing.author.members = team.members.map((t) => {
                      const username = ctx.findUsername(nowcoder, t);
                      if (username) {
                        contest.participantNumber++;
                        ctx.addUserContest(
                          username,
                          { ...contest, standings: undefined },
                          standing.author
                        );
                        return username;
                      } else {
                        return t;
                      }
                    });
                    standing.author.teamName = team.name;
                    standing.author.teamUrl = team.teamUrl;
                  }
                }
              }
            } else {
              // 404
            }
          }
        }
      }
    }
  ];
}

export default nowocderPlugin;
