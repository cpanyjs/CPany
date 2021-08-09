import type { AxiosInstance } from 'axios';

import { ILoadPlugin } from '@cpany/core';

export function contestListPlugin(api: AxiosInstance): ILoadPlugin {
  const name = 'codeforces/contest.json';
  return {
    name,
    async load(id) {
      if (id === name) {
        const {
          data: { result }
        } = await api.get('contest.list');
        return JSON.stringify(result, null, 2);
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
        } = await api.get('contest.list.gym');
        return JSON.stringify(result, null, 2);
      }
    }
  };
}
