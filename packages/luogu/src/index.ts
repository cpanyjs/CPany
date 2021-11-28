import type { CPanyPlugin } from '@cpany/core';
import type { ICPanyPluginConfig, IHandle } from '@cpany/types';
import type { IHandleWithLuogu } from '@cpany/types/luogu';

import { luogu } from './constant';
import { addToCache, createLuoguHandlePlugin } from './handle';

export function luoguPlugin(_option: ICPanyPluginConfig): CPanyPlugin[] {
  return [
    createLuoguHandlePlugin(),
    {
      name: 'cache',
      platform: luogu,
      async cache(ctx) {
        for (const handle of await ctx.readJsonDir<IHandle>('handle')) {
          addToCache(handle);
        }
      }
    },
    {
      name: 'load',
      platform: luogu,
      async load(_option, ctx) {
        const handles = await ctx.readJsonDir<IHandleWithLuogu>('handle');
        for (const handle of handles) {
          ctx.addHandle(handle);
        }
      }
    }
  ];
}

export default luoguPlugin;
