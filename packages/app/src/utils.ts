import { Ref, ref, unref } from 'vue';
import type { IContest, IProblem } from '@cpany/types';

export function isUndef<T>(
  object: T | undefined | null
): object is undefined | null {
  return object === undefined || object === null;
}

export function isDef<T>(object: T | undefined | null): object is T {
  return object !== undefined && object !== null;
}

function alignNumber(value: number) {
  return (value < 10 ? '0' : '') + value;
}

export function toDate(seconds: number | Ref<number>) {
  const date = new Date(unref(seconds) * 1000);
  const prefix = `${date.getFullYear()}-${alignNumber(
    date.getMonth() + 1
  )}-${alignNumber(date.getDate())} `;
  const hours = alignNumber(date.getHours());
  const minutes = alignNumber(date.getMinutes());
  return ref(prefix + hours + ':' + minutes);
}

export function toNumDuration(duration: number | Ref<number>) {
  const seconds = unref(duration);
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return ref(`${hour}:${alignNumber(minute)}:${alignNumber(second)}`);
}

export function toDuration(duration: number | Ref<number>) {
  const seconds = unref(duration);
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = Math.floor(seconds % 60);
  return ref(
    [
      hour > 0 ? hour + ' 小时' : '',
      minute > 0 ? minute + ' 分钟' : '',
      second > 0 ? second + ' 秒' : ''
    ].join(' ')
  );
}

export const displayContestType = (contest: IContest) => {
  if (contest.type.startsWith('codeforces')) {
    if (/Round/.test(contest.name) || /Div/.test(contest.name)) {
      return 'Codeforces Round';
    } else if (/gym/.test(contest.type)) {
      return 'Codeforces Gym';
    } else {
      return 'Codeforces';
    }
  } else if (contest.type === 'nowcoder') {
    return '牛客竞赛';
  } else if (contest.type === 'hdu') {
    return 'HDu';
  } else if (contest.type === 'lugou') {
    return '洛谷';
  } else if (contest.type === 'pintia') {
    return '拼题A';
  } else if (contest.type === 'atcoder') {
    return 'AtCoder';
  } else {
    const type = contest.type;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
};

export const displayProblemType = (problem: IProblem) => {
  if (problem.type.startsWith('codeforces')) {
    return 'Codeforces';
  } else if (problem.type.startsWith('nowcoder')) {
    return '牛客竞赛';
  } else if (problem.type.startsWith('hdu')) {
    return 'HDu';
  } else if (problem.type.startsWith('luogu')) {
    return '洛谷';
  } else {
    const type = problem.type;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
