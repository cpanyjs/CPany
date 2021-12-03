import axios from 'axios';

import type { CPanyPlugin } from '@cpany/core';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import type { ICPanyPluginConfig } from '@cpany/types';

import { createHduHandlePlugin, addToCache } from './handle';

async function testHDuLive(): Promise<boolean> {
  try {
    await axios.get(`https://acm.hdu.edu.cn/`, {
      timeout: 30 * 1000
    });
    return true;
  } catch {
    return false;
  }
}

export async function hduPlugin(
  _option: ICPanyPluginConfig
): Promise<Array<CPanyPlugin | undefined>> {
  const flag = await testHDuLive();
  return [
    {
      name: 'cache',
      platform: 'hdu',
      async cache(ctx) {
        if (flag) {
          for (const handle of await ctx.readJsonDir<IHandleWithHdu>('handle')) {
            addToCache(handle);
          }
        } else {
          ctx.logger.warning(`Warn  : https://acm.hdu.edu.cn/ is dead.`);
        }
      }
    },
    {
      name: 'load',
      platform: 'hdu',
      async load(_option, ctx) {
        const handles = await ctx.readJsonDir<IHandleWithHdu>('handle');
        for (const handle of handles) {
          ctx.addHandle(handle);
        }
      }
    },
    flag ? createHduHandlePlugin() : undefined
  ];
}

export default hduPlugin;
