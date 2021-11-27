import axios from 'axios';

import type { CPanyPlugin } from '@cpany/core';
import type { ICPanyPluginConfig, IHandle } from '@cpany/types';
import type { IHandleWithLuogu } from '@cpany/types/luogu';

import type { ICookie } from './type';
import { addToCache, createLuoguHandlePlugin } from './handle';

function loadCookie(): ICookie {
  const clientId = process.env.CLIENT_ID;
  const uid = process.env.UID;
  if (!clientId) {
    console.error('Please set env variable CLIENT_ID !');
    process.exit(1);
  }
  if (!uid) {
    console.error('Please set env variable UID !');
    process.exit(1);
  }
  return { clientId, uid };
}

export function luoguPlugin(_option: ICPanyPluginConfig): CPanyPlugin[] {
  const cookie = loadCookie();

  const api = axios.create({
    baseURL: 'https://www.luogu.com.cn/',
    headers: {
      'x-luogu-type': 'content-only',
      Cookie: `_uid=${cookie.uid}; __client_id=${cookie.clientId}`
    }
  });

  return [
    createLuoguHandlePlugin(api),
    {
      name: 'cache',
      platform: 'luogu',
      async cache(ctx) {
        for (const handle of await ctx.readJsonDir<IHandle>('handle')) {
          addToCache(handle);
        }
      }
    },
    {
      name: 'load',
      platform: 'luogu',
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
