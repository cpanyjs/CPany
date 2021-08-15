import type { IContest, RouteKey } from '@cpany/types';
import { contests as cfContests } from './codeforces';

/* __imports__ */

const contests: RouteKey<IContest>[] = [...cfContests];

/* __contests__ */

export { contests };
