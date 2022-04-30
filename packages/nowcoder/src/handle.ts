import { Logger, QueryPlugin } from '@cpany/core';
import { ISubmission, ParticipantType, Verdict } from '@cpany/types';
import { IHandleWithNowcoder, INowcoderTeam } from '@cpany/types/nowcoder';

import { parse } from 'node-html-parser';

import { nowcoder, api } from './constant';
import { addContestId } from './contest';

const subCache = new Map<string, ISubmission[]>();

const handleCache = new Map<string, IHandleWithNowcoder>();

const teamCache = new Map<number, INowcoderTeam>();
const teamNameCache = new Map<string, ISubmission[]>();

const newHandles = new Map<string, IHandleWithNowcoder>();

export function addToCache(handle: IHandleWithNowcoder) {
  handleCache.set(handle.handle, handle);
  subCache.set(handle.handle, handle.submissions);
  const interCache = new Map<string, ISubmission[]>();
  for (const sub of handle.submissions) {
    if (sub.author.teamName) {
      if (!interCache.has(sub.author.teamName)) {
        interCache.set(sub.author.teamName, []);
      }
      interCache.get(sub.author.teamName)!.push(sub);
    }
  }
  for (const [key, subs] of interCache) {
    if (!teamNameCache.has(key)) {
      teamNameCache.set(key, subs);
    }
  }
}

export function loadCache() {
  return [[...handleCache.values()], [...newHandles.values()]];
}

export function loadUids(): number[] {
  return [...newHandles.values()].flatMap((h) => [
    +h.handle,
    ...h.nowcoder.teams.map((t) => t.teamId)
  ]);
}

export function createHandlePlugin(): QueryPlugin {
  return {
    name: 'handle',
    platform: nowcoder,
    async query(id, { logger }) {
      const handle = await queryHandle(id);
      handle.nowcoder.teams = await queryTeamList(id, logger);
      handle.nowcoder.contests = await queryContestHistory(
        id,
        ...handle.nowcoder.teams.map((t) => '' + t.teamId)
      );
      handle.submissions = await querySubmission(id, handle.nowcoder.name, logger);
      mergeTeamSubmissions(handle);
      newHandles.set(handle.handle, handle);
      return JSON.stringify(handle, null, 2);
    }
  };
}

async function queryHandle(handle: string): Promise<IHandleWithNowcoder> {
  const handleUrl = `https://ac.nowcoder.com/acm/contest/profile/${handle}`;
  const { data } = await api.get(`/acm/contest/profile/${handle}`);
  const root = parse(/<body>([\s\S]*)<\/body>/.exec(data)![0]);
  const avatar = root.querySelector('.head-pic img')?.getAttribute('src');
  const getName = (text: string) => {
    const match = /data-title="([^"]+)"/.exec(text);
    return match![1];
  };
  const name = getName(root.querySelector('.coder-info-detail').innerHTML);
  const rating = root.querySelector('.state-num')?.childNodes[0].innerText;

  return {
    type: nowcoder,
    handle,
    submissions: [],
    avatar,
    handleUrl,
    nowcoder: {
      name,
      rating: rating !== undefined && rating !== null && rating !== '暂无' ? +rating : undefined,
      teams: [],
      contests: []
    }
  };
}

async function querySubmission(
  handle: string,
  name: string,
  logger: Logger,
  team = false
): Promise<ISubmission[]> {
  const subs: ISubmission[] = subCache.get(handle) ?? [];
  const ids = new Set(subs.map((s) => s.id));
  const fetchPage = async (page: number) => {
    const { data } = await api.get(
      `/acm/contest/profile/${handle}/practice-coding?pageSize=200&orderType=DESC&page=${page}`
    );
    const root = parse(/<body>([\s\S]*)<\/body>/.exec(data)![0]);
    const oldLen = subs.length;
    for (const row of root.querySelectorAll('table.table-hover tbody tr')) {
      const childNodes = row.querySelectorAll('td');
      const id = +childNodes[0].childNodes[0].innerText!;
      if (ids.has(id)) continue;

      const problemName = childNodes[1].querySelector('a').innerText!;
      const parseId = (text: string) => {
        const split = text.split('/');
        return +split[split.length - 1];
      };
      const problemId = parseId(childNodes[1].querySelector('a').getAttribute('href')!);

      const verdictRaw = childNodes[2].innerHTML!;
      const checkVerdict = (text: string) => verdictRaw.indexOf(text) !== -1;
      const verdict = checkVerdict('答案正确')
        ? Verdict.OK
        : checkVerdict('运行超时')
        ? Verdict.TIME_LIMIT_EXCEEDED
        : checkVerdict('执行出错')
        ? Verdict.RUNTIME_ERROR
        : checkVerdict('段错误')
        ? Verdict.RUNTIME_ERROR
        : Verdict.WRONG_ANSWER;

      const language = childNodes[7].innerText;
      const time = new Date(childNodes[8].innerText);

      subs.push({
        type: nowcoder,
        id,
        creationTime: time.getTime() / 1000,
        language,
        verdict,
        author: {
          members: [handle],
          participantTime: time.getTime() / 1000,
          participantType: ParticipantType.PRACTICE
        },
        problem: {
          type: nowcoder,
          id: problemId,
          name: problemName,
          problemUrl: `https://ac.nowcoder.com/acm/problem/${problemId}`
        },
        submissionUrl: `https://ac.nowcoder.com/acm/contest/view-submission?submissionId=${id}`
      });
      ids.add(id);
    }
    if (subs.length === oldLen) return false;
    logger.info(
      `Fetch: (${team ? 'team' : 'name'}: ${name}, id: ${handle}) has fetched ${
        subs.length - oldLen
      } new submissions at page ${page}`
    );
    return true;
  };
  for (let page = 1; ; page++) {
    if (!(await fetchPage(page))) {
      break;
    }
  }
  return subs;
}

function mergeTeamSubmissions(handle: IHandleWithNowcoder) {
  const ids = new Set(handle.submissions.map((s) => s.id));
  for (const team of handle.nowcoder.teams) {
    const subs = subCache.get('' + team.teamId) ?? [];
    for (const sub of subs) {
      if (!ids.has(sub.id)) {
        ids.add(sub.id);
        handle.submissions.push(sub);
      }
    }
  }
}

async function queryTeamList(handle: string, logger: Logger): Promise<INowcoderTeam[]> {
  const teams: INowcoderTeam[] = [];
  const {
    data: {
      data: { dataList }
    }
  } = await api.get(`/acm/contest/profile/user-team-list?uid=${handle}&pageSize=100`);

  for (const team of dataList) {
    const teamId: number = team.teamId;

    if (teamCache.has(teamId)) {
      teams.push(teamCache.get(teamId)!);
      continue;
    }

    const {
      data: {
        data: { dataList }
      }
    } = await api.get(`/acm/team/member-list?teamId=${teamId}`);

    const data: INowcoderTeam = {
      teamId,
      name: team.name,
      nickname: team.nickname,
      members: dataList.map((u: any) => '' + u.uid),
      avatar: team.logoUrl,
      teamUrl: `https://ac.nowcoder.com/acm/contest/profile/${team.teamId}`,
      rating: team.hasRating ? +team.rating.toFixed(0) : undefined,
      rank: team.hasRank ? team.rank : undefined
    };
    teamCache.set(teamId, data);
    teams.push(data);
    if (teamNameCache.has(data.name)) {
      subCache.set('' + teamId, teamNameCache.get(data.name)!);
    }

    const subs = await querySubmission('' + teamId, data.name, logger, true);
    for (const sub of subs) {
      sub.author.members = data.members;
      sub.author.teamName = data.name;
    }
    subCache.set('' + teamId, subs);
  }
  return teams;
}

async function queryContestHistory(...uids: string[]): Promise<number[]> {
  const ids = new Set<number>();
  for (const uid of uids) {
    for (let page = 1; ; page++) {
      const {
        data: {
          data: { dataList }
        }
      } = await api.get(
        `/acm-heavy/acm/contest/profile/contest-joined-history?uid=${uid}&page=${page}&onlyJoinedFilter=true&onlyRatingFilter=false&contestEndFilter=true`
      );
      let oldLen = ids.size;
      for (const data of dataList) {
        ids.add(data.contestId);
        addContestId(data.contestId);
      }
      if (ids.size === oldLen) break;
    }
  }
  return [...ids.values()];
}
