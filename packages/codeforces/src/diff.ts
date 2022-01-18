import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { DiffPlugin, diff } from '@cpany/core';

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
