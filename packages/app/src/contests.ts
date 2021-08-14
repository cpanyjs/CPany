import type { IContest, RouteKey } from '@cpany/types';

/* __imports__ */

const contests: RouteKey<IContest>[] = [];

/* __contests__ */

const cfMap: Map<number, RouteKey<IContest>> = new Map();
for (const contest of contests) {
  if (contest.type.startsWith('codeforces')) {
    cfMap.set(contest.id as number, contest);
  }
}

export function findCodeforces(id: number | string) {
  return cfMap.get(+id) ?? null;
}

export { contests };
