import type { IContest, RouteKey } from '@cpany/types';
import { load } from '@cpany/compress/load';

import _cfContests from './cpany/codeforces.json';
import _otherContests from './cpany/contests.json';

const cfContests = load<RouteKey<IContest>[]>(_cfContests);
const otherContests = load<RouteKey<IContest>[]>(_otherContests);

export const contests = [...cfContests, ...otherContests].sort(
  (lhs, rhs) => rhs.startTime - lhs.startTime
);
