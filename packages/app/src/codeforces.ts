import type { IContest, RouteKey } from '@cpany/types';

import cfContests from './cpany/codeforces.json';

export const contests: RouteKey<IContest>[] = cfContests;

const cfMap: Map<number, RouteKey<IContest>> = new Map();
for (const contest of contests) {
  if (contest.type.startsWith('codeforces')) {
    cfMap.set(contest.id as number, contest);
  }
}

export function findCodeforces(id: number | string) {
  return cfMap.get(+id) ?? null;
}
