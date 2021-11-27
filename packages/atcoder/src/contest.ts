import type { AxiosInstance } from 'axios';
import { parse } from 'node-html-parser';

import { createRetryContainer, FetchPlugin } from '@cpany/core';
import {
  IContest,
  IContestStanding,
  IContestSubmission,
  ISubmission,
  ParticipantType,
  Verdict
} from '@cpany/types';

import { atcoder } from './constant';

const handleMap = new Map<string, string>();
const contestantSet = new Map<string, string[]>();
const contestCache = new Map<string, IContest>();
const contestPracticeCache = new Map<string, IContestStanding[]>();
const contestSubmissionsUrl = new Map<string, Map<string, string>>();

export function pushContest(contest: string, handle: string) {
  if (!contestantSet.has(contest)) {
    contestantSet.set(contest, []);
  }
  contestantSet.get(contest)!.push(handle);
}

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

export function addContestPractice(contestId: string, handle: string, submissions: ISubmission[]) {
  if (!contestPracticeCache.has(contestId)) {
    contestPracticeCache.set(contestId, []);
  }

  const addSubUrl = (pid: string, url?: string) => {
    if (!url) return;

    if (contestSubmissionsUrl.has(handle)) {
      contestSubmissionsUrl.get(handle)!.set(pid, url);
    } else {
      contestSubmissionsUrl.set(handle, new Map([[pid, url]]));
    }
  };

  let practiceCount = 0;
  const allSubs = new Map<number, IContestSubmission>();
  for (const sub of submissions.sort((lhs, rhs) => lhs.creationTime - rhs.creationTime)) {
    const pid = parseIndex(sub.problem.id as string);

    if (sub.author.participantType === ParticipantType.PRACTICE) {
      practiceCount++;

      if (allSubs.has(pid)) {
        const oldSub = allSubs.get(pid)!;

        const update = () => {
          oldSub.id = sub.id;
          oldSub.creationTime = sub.creationTime;
          oldSub.relativeTime = sub.creationTime;
          oldSub.submissionUrl = sub.submissionUrl;
        };

        if (sub.verdict === Verdict.OK) {
          if (oldSub.verdict !== Verdict.OK) {
            oldSub.verdict = Verdict.OK;
            update();
          }
        } else {
          if (oldSub.verdict !== Verdict.OK) {
            oldSub.dirty! += 1;
            update();
          }
        }
      } else {
        allSubs.set(pid, {
          ...sub,
          dirty: sub.verdict === Verdict.OK ? 0 : 1,
          problemIndex: pid,
          relativeTime: sub.creationTime
        });
      }
    } else {
      if (sub.verdict === Verdict.OK) {
        const pid = (sub.problem.id as string).split('');
        const index =
          '_' +
          String.fromCharCode(pid.pop()!.charCodeAt(0) - 'A'.charCodeAt(0) + 'a'.charCodeAt(0));
        addSubUrl(pid.concat(index).join(''), sub.submissionUrl);
      }
    }
  }

  if (practiceCount === 0) return;

  const standing: IContestStanding = {
    author: {
      members: [handle],
      teamName: handleMap.get(handle) ?? handle,
      participantType: ParticipantType.PRACTICE,
      participantTime: 0
    },
    rank: Number.MAX_SAFE_INTEGER,
    solved: submissions.filter(
      (sub) => sub.author.participantType === ParticipantType.PRACTICE && sub.verdict === Verdict.OK
    ).length,
    penalty: 0,
    submissions: [...allSubs.values()]
  };

  contestPracticeCache.get(contestId)!.push(standing);
}

export function createAtCoderContestPlugin(
  api: AxiosInstance,
  _handleMap: Map<string, string>
): FetchPlugin {
  for (const [key, value] of _handleMap) handleMap.set(key, value);

  return {
    name: 'contest',
    platform: atcoder,
    async fetch({ logger }) {
      const retry = createRetryContainer(logger, 5);
      const contests: IContest[] = [];
      let planSz = 0,
        curRunSz = 0;

      for (const [contestId, handlesParticipant] of contestantSet) {
        const cacheStandings =
          contestCache
            .get(contestId)
            ?.standings?.map((standing) => standing.author.members)
            .flat() ?? [];
        if (contestCache.has(contestId) && isHandlesLte(handlesParticipant, cacheStandings)) {
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

      for (const contest of contests) {
        if (!!contest.standings && !!contest.id && contestPracticeCache.get(String(contest.id))) {
          const practice = contestPracticeCache.get(String(contest.id))!;

          contest.standings.push(
            ...practice
              .map((standing) => {
                // fill some unknown time
                standing.author.participantTime = contest.startTime;
                standing.submissions = standing.submissions.map((sub) => {
                  sub.relativeTime -= contest.startTime;
                  return sub;
                });
                return standing;
              })
              .sort((lhs, rhs) => rhs.solved - lhs.solved)
          );
        }
      }

      return JSON.stringify(contests, null, 2);
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
        const username =
          standing.UserScreenName !== '' ? standing.UserScreenName : standing.UserName;

        let penalty = standing.TotalResult.Penalty * 20 * 60;
        const submissions: IContestSubmission[] = [];
        for (const pid in standing.TaskResults) {
          const result = standing.TaskResults[pid];
          const problemIndex = parseIndex(pid);

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
            penalty += relativeTime;

            submissions.push({
              id: -1,
              creationTime: startTime + relativeTime,
              relativeTime,
              problemIndex,
              verdict: Verdict.OK,
              dirty: result.Penalty,
              submissionUrl: contestSubmissionsUrl.get(username)?.get(pid)
            });
          }
        }

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

function parseIndex(index: string) {
  if (/[a-z]$/.test(index)) {
    return index.charCodeAt(index.length - 1) - 'a'.charCodeAt(0);
  } else {
    return index.charCodeAt(index.length - 1) - 'A'.charCodeAt(0);
  }
}

function isHandlesLte(sa: string[], sb: string[]) {
  const set = new Set(sa);
  for (const handle of sb) set.delete(handle);
  return set.size === 0;
}
