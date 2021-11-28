import type { LoadPlugin } from '@cpany/core';
import { IContest, Key, ParticipantType } from '@cpany/types';
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
      const contests = (await ctx.readJsonFile<IContest[]>('contest')).map((c) => ({
        ...c,
        key: String(c.id!!)
      }));
      const gymContests = (await ctx.readJsonFile<IContest[]>('gym-contest')).map((c) => ({
        ...c,
        key: String(c.id!!)
      }));
      const { findRound } = createRoundSet(...contests, ...gymContests);
      for (const handle of handles) {
        for (const submission of handle.submissions) {
          if (
            submission.author.participantType === ParticipantType.CONTESTANT ||
            submission.author.participantType === ParticipantType.VIRTUAL ||
            submission.author.participantType === ParticipantType.OUT_OF_COMPETITION
          ) {
            const contestId = +/^(\d+)/.exec('' + submission.problem.id)![1];
            const contest = findRound(contestId)!;

            const username = ctx.findUsername(handle.type, handle.handle);
            if (username) {
              ctx.addUserContest(username, contest, submission.author);
            }

            // Dep: codeforces fix gym startTime
            if (!contest.startTime) {
              contest.startTime = submission.author.participantTime;
            }
          }
        }
      }

      for (const contest of contests) {
        if (!/[а-яА-ЯЁё]/.test(contest.name) || contest.participantNumber > 0) {
          ctx.addContest(contest);
        }
      }
      for (const contest of gymContests) {
        if (contest.participantNumber > 0) {
          ctx.addContest(contest);
        }
      }
    }
  };
}

function createRoundSet(...contests: Key<IContest>[]) {
  const map: Map<number, Key<IContest>> = new Map();
  for (const contest of contests) {
    map.set(contest.id as number, contest);
  }

  const findRound = (id: number | string) => {
    return map.get(+id) ?? undefined;
  };

  return { findRound };
}
