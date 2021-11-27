import type { CPanyPlugin } from '@cpany/core';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import { ICPanyPluginConfig } from '@cpany/types';

import { createHduHandlePlugin, addToCache } from './handle';

export function hduPlugin(_option: ICPanyPluginConfig): CPanyPlugin[] {
  return [
    {
      name: 'cache',
      platform: 'hdu',
      async cache(ctx) {
        for (const handle of await ctx.readJsonDir<IHandleWithHdu>('handle')) {
          addToCache(handle);
        }
      }
    },
    createHduHandlePlugin()
  ];
}

export default hduPlugin;
