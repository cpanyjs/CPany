import type { CPanyPlugin } from '@cpany/core';
import type { ICPanyPluginConfig } from '@cpany/types';
import type { IHandleWithNowcoder } from '@cpany/types/nowcoder';

import { nowcoder } from './constant';
import { addToCache, createHandlePlugin } from './handle';

export function nowocderPlugin(_option: ICPanyPluginConfig): CPanyPlugin[] {
  return [
    {
      name: 'cache',
      platform: nowcoder,
      async cache(ctx) {
        for (const handle of await ctx.readJsonDir<IHandleWithNowcoder>('handle')) {
          addToCache(handle);
        }
      }
    },
    createHandlePlugin(),
    {
      name: 'load',
      platform: nowcoder,
      async load(_option, ctx) {
        const handles = await ctx.readJsonDir<IHandleWithNowcoder>('handle');
        for (const handle of handles) {
          ctx.addHandle(handle);
        }
      }
    }
  ];
}

export default nowocderPlugin;
