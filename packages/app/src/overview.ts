import type { IContestOverview, IUserOverview } from '@cpany/types';

let title = '';
let recentTime = 30 * 24 * 3600;
let recentContestsCount = 15;
let recentUserCount = 5;

let allSubmissionCount = 0;
let allOkSubmissionCount = 0;
let allContestCount = 0;
/* __inject__ */

const recentStartTime = new Date().getTime() / 1000 - recentTime;

const contests: IContestOverview[] = [];

const users: IUserOverview[] = [];

/* __contests__ */

/* __users__ */

export {
  contests,
  users,
  title,
  recentTime,
  recentContestsCount,
  recentUserCount,
  recentStartTime,
  allSubmissionCount,
  allOkSubmissionCount,
  allContestCount
};
