import type { AxiosInstance } from 'axios';

import type { ILoadPlugin } from '@cpany/core';
import type { ContestDTO } from '@cpany/types/codeforces';

function transformContestInfo(contest: ContestDTO) {
  return {
    id: contest.id,
    name: contest.name,
    contestUrl: `http://codeforces.com/contest/${contest.id}`,
    standingsUrl: `http://codeforces.com/contest/${contest.id}/standings`,
    type: contest.type,
    phase: contest.phase,
    startTimeSeconds: contest.startTimeSeconds,
    durationSeconds: contest.durationSeconds
  };
}

function transformGymContestInfo(contest: ContestDTO) {
  return {
    id: contest.id,
    name: contest.name,
    contestUrl: `http://codeforces.com/gym/${contest.id}`,
    standingsUrl: `http://codeforces.com/gym/${contest.id}/standings`,
    type: contest.type,
    phase: contest.phase,
    startTimeSeconds: contest.startTimeSeconds,
    durationSeconds: contest.durationSeconds
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
        return JSON.stringify(result.map(transformContestInfo), null, 2);
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
        return JSON.stringify(result.map(transformGymContestInfo), null, 2);
      }
    }
  };
}
