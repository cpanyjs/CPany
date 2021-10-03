import type { AxiosInstance } from 'axios';
import { parse } from 'node-html-parser';

import { IPlugin, createRetryContainer } from '@cpany/core';
import { IContest, IContestSubmission, ParticipantType, Verdict } from '@cpany/types';

const handleMap = new Map<string, string>();
const contestSet = new Set<string>();
const contestCache = new Map<string, IContest>();

export function addContests(contests: IContest[]) {
  for (const contest of contests) {
    if (!!contest.standings) {
      contest.standings = contest.standings.filter(
        (standing) => standing.author.participantType !== ParticipantType.PRACTICE
      );
    }
    contestCache.set(contest.id as string, contest);
  }
}

export function pushContest(contest: string) {
  contestSet.add(contest);
}

export function createAtCoderContestPlugin(
  api: AxiosInstance,
  _handleMap: Map<string, string>
): IPlugin {
  for (const [key, value] of _handleMap) handleMap.set(key, value);

  return {
    name: 'atcoder/contest.json',
    async load(id: string, { logger }) {
      if (id === 'atcoder/contest.json') {
        const retry = createRetryContainer(logger, 5);
        const contests: IContest[] = [];
        let planSz = 0,
          curRunSz = 0;

        for (const contestId of contestSet) {
          if (contestCache.has(contestId)) {
            contests.push(contestCache.get(contestId)!);
          } else {
            planSz++;

            retry.add(`AtCoder Contest ${contestId}`, async () => {
              logger.info(`Fetch: AtCoder Contest ${contestId} (${curRunSz + 1}/${planSz})`);

              try {
                const contest = await fecthContest(api, contestId);
                contests.push({
                  ...contest,
                  ...parseStandings(
                    contestId,
                    contest.startTime,
                    await fetchStandings(api, contestId)
                  )
                });
                curRunSz++;
                return true;
              } catch (error) {
                logger.error('Error: ' + (error as any).message);
                return false;
              }
            });
          }
        }

        logger.info(`Fetch: plan to fetch ${planSz} contests`);
        await retry.run();

        return JSON.stringify(contests, null, 2);
      }
    }
  };
}

async function fecthContest(api: AxiosInstance, contestId: string): Promise<IContest> {
  const { data } = await api.get(`/contests/${contestId}`);
  const root = parse(data);

  const durations = root.querySelectorAll('.contest-duration a');
  const startTime = new Date(durations[0].innerText).getTime() / 1000;
  const endTime = new Date(durations[1].innerText).getTime() / 1000;

  return {
    type: 'atcoder',
    name: root.querySelector('h1').innerText,
    startTime,
    duration: endTime - startTime,
    participantNumber: 0,
    id: contestId,
    contestUrl: `https://atcoder.jp/contests/${contestId}`,
    standingsUrl: `https://atcoder.jp/contests/${contestId}/standings`,
    inlinePage: true
  };
}

type PS = Required<Pick<IContest, 'problems' | 'standings'>>;

function parseStandings(contestId: string, startTime: number, { problems, standings }: PS): PS {
  const pIndex = (index: string) => {
    if (/[a-z]$/.test(index)) {
      return index.charCodeAt(index.length - 1) - 'a'.charCodeAt(0);
    } else {
      return index.charCodeAt(index.length - 1) - 'A'.charCodeAt(0);
    }
  };

  return {
    problems: problems.map((problem: any, index: number) => ({
      type: 'atcoder',
      contestId,
      index,
      name: problem.TaskName,
      problemUrl: `https://atcoder.jp/contests/${contestId}/tasks/${problem.TaskScreenName}`
    })),
    standings: standings
      .map((standing: any) => {
        let penalty = standing.TotalResult.Penalty * 20 * 60;
        const submissions: IContestSubmission[] = [];
        for (const pid in standing.TaskResults) {
          const result = standing.TaskResults[pid];
          const problemIndex = pIndex(pid);

          if (result.Score === 0) {
            submissions.push({
              id: -1,
              creationTime: -1,
              relativeTime: -1,
              problemIndex,
              dirty: result.Failure
            });
          } else {
            const relativeTime = Math.round(result.Elapsed / 1000000000);

            submissions.push({
              id: -1,
              creationTime: startTime + relativeTime,
              relativeTime,
              problemIndex,
              verdict: Verdict.OK,
              dirty: result.Penalty
            });
          }
        }
        const username =
          standing.UserScreenName !== '' ? standing.UserScreenName : standing.UserName;

        return {
          author: {
            members: [username],
            teamName: handleMap.get(username) ?? username,
            participantType: standing.IsRated
              ? ParticipantType.CONTESTANT
              : ParticipantType.OUT_OF_COMPETITION,
            participantTime: startTime
          },
          rank: standing.Rank,
          solved: standing.TotalResult.Accepted,
          penalty,
          submissions
        };
      })
      .filter((standing) => standing.submissions.length > 0)
  };
}

async function fetchStandings(api: AxiosInstance, contestId: string): Promise<PS> {
  const { data } = await api.get(`/contests/${contestId}/standings/json`);
  const problems = data.TaskInfo;
  const standings = data.StandingsData.filter(
    (row: any) => handleMap.has(row.UserName) || handleMap.has(row.UserScreenName)
  );
  return { problems, standings };
}
