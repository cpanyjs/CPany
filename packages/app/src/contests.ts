import type { IContest, RouteKey } from '@cpany/types';

import cfContests from './cpany/codeforces.json';
import otherContests from './cpany/contests.json';

export const contests = (
  [...cfContests, ...otherContests] as RouteKey<IContest>[]
).sort((lhs, rhs) => rhs.startTime - lhs.startTime);
