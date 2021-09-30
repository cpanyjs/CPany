import type { IPlugin } from '@cpany/core';

const contestSet = new Set<string>();

export function addContest(contest: string) {
  contestSet.add(contest);
}

export function createContestPlugin(): IPlugin {
  return {
    name: 'atcoder/contest',
    async load(id: string) {
      if (id === 'atcoder/contest.json') {
        return '[]';
      }
    }
  };
}
