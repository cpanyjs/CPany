import type { AxiosInstance } from 'axios';

import type { ILoadPlugin } from '@cpany/core';
import type { IContest } from '@cpany/types';
import type { ContestDTO } from '@cpany/types/codeforces';

import { codeforces } from './constant';

function transformContestInfo(contest: ContestDTO): IContest {
  const type = /Div/.test(contest.name) ? 'cf' : contest.type.toLowerCase();

  return {
    type: codeforces + '/' + type,
    name: contest.name,
    startTime: contest.startTimeSeconds,
    duration: contest.durationSeconds,
    participantNumber: 0,
    id: contest.id,
    phase: contest.phase,
    contestUrl: `https://codeforces.com/contest/${contest.id}`,
    standingsUrl: `https://codeforces.com/contest/${contest.id}/standings`
  };
}

function transformGymContestInfo(contest: ContestDTO): IContest {
  return {
    type: codeforces + '/gym/' + contest.type.toLowerCase(),
    name: contest.name,
    startTime: contest.startTimeSeconds,
    duration: contest.durationSeconds,
    participantNumber: 0,
    id: contest.id,
    phase: contest.phase,
    contestUrl: `https://codeforces.com/gym/${contest.id}`,
    standingsUrl: `https://codeforces.com/gym/${contest.id}/standings`
  };
}

export function contestListPlugin(api: AxiosInstance): ILoadPlugin {
  const name = 'codeforces/contest.json';
  return {
    name,
    async load(id) {
      if (id === name) {
        const {
          data: { result }
        } = await api.get('contest.list');
        return JSON.stringify(
          result
            .map(transformContestInfo)
            .filter(({ phase }: IContest) => phase === 'FINISHED'),
          null,
          2
        );
      }
    }
  };
}

export function gymContestListPlugin(api: AxiosInstance): ILoadPlugin {
  const name = 'codeforces/gym-contest.json';
  return {
    name,
    async load(id) {
      if (id === name) {
        const {
          data: { result }
        } = await api.get('contest.list', { params: { gym: true } });
        return JSON.stringify(
          result
            .map(transformGymContestInfo)
            .filter(({ phase }: IContest) => phase === 'FINISHED'),
          null,
          2
        );
      }
    }
  };
}
