import rawHistory from '~cpany/log';
import { load } from '@cpany/compress/load';
import { DiffLog, UserDiffLog } from '@cpany/types';
import { toDay, toDate } from '@/utils';

const content = load<{ history: DiffLog; commits: string[]; startTime: number }>(rawHistory);

export const history = content.history;

export const commits = content.commits;

export const startTime = toDate(content.startTime);

export type ISub = UserDiffLog['newSubmissions'][0];

class Record {
  submissions: Map<string, ISub[]> = new Map();

  constructor() {}

  mergeSub(user: string, sub: ISub) {
    if (this.submissions.has(user)) {
      this.submissions.get(user)!.push(sub);
    } else {
      this.submissions.set(user, [sub]);
    }
  }

  list() {
    const result: UserDiffLog[] = [];
    for (const [name, sub] of this.submissions) {
      result.push({ name, newSubmissions: sub, newContests: [] });
    }
    return result.sort((lhs, rhs) => rhs.newSubmissions.length - lhs.newSubmissions.length);
  }
}

const groupByDay = new Map<string, Record>();

for (const userLog of history.user ?? []) {
  for (const sub of userLog.newSubmissions) {
    if (sub.creationTime < content.startTime) continue;
    const d = toDay(sub.creationTime).value;
    if (!groupByDay.has(d)) {
      groupByDay.set(d, new Record());
    }
    groupByDay.get(d)!.mergeSub(userLog.name, sub);
  }
}

export const records = [...groupByDay.entries()]
  .map((r) => ({ day: r[0], record: r[1] }))
  .sort((lhs, rhs) => rhs.day.localeCompare(lhs.day))
  .map((r) => ({
    day: r.day.replace(/(\d+)-0?(\d+)-0?(\d+)/, '$1 年 $2 月 $3 日'),
    record: r.record
  }));
