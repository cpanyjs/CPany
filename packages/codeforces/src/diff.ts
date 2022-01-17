import type { DiffPlugin } from '@cpany/core';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';

import { codeforces } from './constant';

export function diffCodeforcesPlugin(
  oldHandles: IHandleWithCodeforces[],
  newHandles: IHandleWithCodeforces[]
): DiffPlugin {
  return {
    platform: codeforces,
    name: 'diff',
    async diff(ctx) {
      const oldMap = new Map(oldHandles.map((h) => [h.handle, h]));
      for (const handle of newHandles) {
        const oldHandle = oldMap.get(handle.handle);

        const sub = diff((sub) => '' + sub.id, oldHandle?.submissions ?? [], handle.submissions);
        ctx.addHandleSubmission(handle.handle, ...sub);
      }
    }
  };
}

function diff<T>(f: (item: T) => string, old: T[], cur: T[]): T[] {
  const delta: T[] = [];
  const set = new Set(old.map(f));
  for (const item of cur) {
    if (!set.has(f(item))) {
      delta.push(item);
    }
  }
  return delta;
}
