import { DiffPlugin, diff } from '@cpany/core';

import { nowcoder } from './constant';
import { loadCache } from './handle';

export function diffNowcoderPlugin(): DiffPlugin {
  return {
    platform: nowcoder,
    name: 'diff',
    async diff(ctx) {
      const [oldHandles, newHandles] = loadCache();
      const oldMap = new Map(oldHandles.map((h) => [h.handle, h]));
      for (const handle of newHandles) {
        const oldHandle = oldMap.get(handle.handle);

        const sub = diff((sub) => '' + sub.id, oldHandle?.submissions ?? [], handle.submissions);
        ctx.addHandleSubmission(handle.handle, ...sub);
      }
    }
  };
}
