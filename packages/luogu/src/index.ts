import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig, IHandle } from '@cpany/types';
import { listJsonFiles } from '@cpany/utils';

import path from 'path';

import type { ICookie } from './type';
import { createLuoguHandlePlugin } from './handle';
import axios from 'axios';

function loadCookie(): ICookie {
  const clientId = process.env.CLIENT_ID;
  const uid = process.env.UID;
  if (!clientId) {
    console.error('Please set env variable CLIENT_ID!');
    process.exit(1);
  }
  if (!uid) {
    console.error('Please set env variable UID!');
    process.exit(1);
  }
  return { clientId, uid };
}

export async function luoguPlugin(
  config: ICPanyConfig & { basePath: string }
): Promise<IPlugin[]> {
  const cookie = loadCookie();

  for (const handlePath of config.handles ?? []) {
    const fullPath = path.resolve(config.basePath, handlePath);
    try {
      for await (const handle of listJsonFiles<IHandle>(fullPath)) {
        if (handle.type.startsWith('luogu')) {
          // addToCache(handle);
        }
      }
    } catch (error) {}
  }

  const api = axios.create({
    baseURL: 'https://www.luogu.com.cn/',
    headers: {
      'x-luogu-type': 'content-only',
      setCookie: `_uid=${cookie.uid}; __client_id=${cookie.clientId}`
    }
  });

  return [
    createLuoguHandlePlugin(api),
    {
      name: 'luogu/clean',
      async load(id) {
        if (id === 'luogu/clean') {
          return '[]';
        }
        return null;
      }
    }
  ];
}
