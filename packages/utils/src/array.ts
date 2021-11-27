import { isDef } from './guard';

export function uniq<T>(array: readonly T[]): T[] {
  return Array.from(new Set(array));
}

export function filterMap<T, U>(array: readonly T[], fn: (arg: T) => U | undefined): U[] {
  return array.map(fn).filter((u) => isDef(u)) as U[];
}
