import type { IContestOverview, IUserOverview } from '@cpany/types';

let title = '';
let recentTime = 30 * 24 * 3600;
let recentContestsCount = 15;
/* __inject__ */

const contests: IContestOverview[] = [];

const users: IUserOverview[] = [];

/* __contests__ */

/* __users__ */

export { contests, users, title, recentTime, recentContestsCount };
