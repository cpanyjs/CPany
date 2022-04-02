import type { FetchPlugin, Logger } from '@cpany/core';
import { IContest, IContestProblem, IContestStanding, ParticipantType } from '@cpany/types';
import { Verdict } from '@cpany/types/dist';

import axios from 'axios';

import { nowcoder } from './constant';
import { loadUids } from './handle';

const contestIds = new Set<number>();

const contestCache = new Map<string | number, IContest>();

export function addContestId(contestId: number) {
  contestIds.add(contestId);
}

export function addContests(contests: IContest[]) {
  for (const contest of contests) {
    contestCache.set(contest.id!, contest);
  }
}

export function contestListPlugin(): FetchPlugin {
  return {
    name: 'contest',
    platform: nowcoder,
    async fetch({ logger }) {
      const uids = new Set(loadUids());
      const contests: IContest[] = [];
      let i = 0;
      for (const cid of contestIds) {
        logger.info(`Fetch: Nowcoder Contest ${cid} (${++i}/${contestIds.size})`);
        contests.push(await fetchContest(cid, uids));
      }
      return JSON.stringify(contests, null, 2);
    }
  };
}

async function fetchContest(contestId: number, uids: Set<number>): Promise<IContest> {
  if (contestCache.get(contestId)) {
    return contestCache.get(contestId)!;
  }

  const {
    data: {
      data: {
        sameContests: [rawContest]
      }
    }
  } = await axios.get(
    `https://ac.nowcoder.com/acm/contest/rank/same-contest-list?contestId=${contestId}`
  );
  const problems: IContestProblem[] = [];
  const standings: IContestStanding[] = [];

  for (let page = 1; ; page++) {
    const {
      data: { data }
    } = await axios.get(
      `https://ac.nowcoder.com/acm-heavy/acm/contest/real-time-rank-data?id=${contestId}&pageSize=200&page=${page}`
    );
    if (page > data.basicInfo.pageCount) break;

    if (page === 1) {
      for (const prob of data.problemData) {
        problems.push({
          type: nowcoder,
          contestId,
          index: prob.name,
          name: prob.name + ' ' + prob.problemId,
          problemUrl: `https://ac.nowcoder.com/acm/contest/${contestId}/${prob.name}`
        });
      }
    }

    for (const rank of data.rankData) {
      const uid = rank.uid;
      if (!uids.has(uid)) continue;

      standings.push({
        author: {
          members: ['' + uid],
          participantType: ParticipantType.CONTESTANT,
          participantTime: rawContest.startTime / 1000
        },
        rank: rank.ranking,
        solved: rank.acceptedCount,
        penalty: rank.penaltyTime / 1000,
        submissions: rank.scoreList
          .map((sc: any, problemIndex: number) => {
            if (!sc.accepted && !sc.failedCount) {
              return undefined;
            } else {
              return {
                id: sc.submissionId,
                creationTime: sc.acceptedTime / 1000,
                relativeTime: (sc.acceptedTime - rawContest.startTime) / 1000,
                problemIndex,
                verdict: sc.accepted ? Verdict.OK : Verdict.WRONG_ANSWER,
                dirty: sc.failedCount ?? 0,
                submissionUrl: `https://ac.nowcoder.com/acm/contest/view-submission?submissionId=${sc.submissionId}`
              };
            }
          })
          .filter((s: any | undefined) => !!s)
      });
    }
  }

  return {
    type: nowcoder,
    id: contestId,
    name: rawContest.name,
    startTime: rawContest.startTime / 1000,
    duration: (rawContest.endTime - rawContest.startTime) / 1000,
    participantNumber: 0,
    contestUrl: `https://ac.nowcoder.com/acm/contest/${contestId}`,
    standingsUrl: `https://ac.nowcoder.com/acm/contest/${contestId}#rank`,
    problems,
    standings,
    inlinePage: true
  };
}
