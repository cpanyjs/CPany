import path from 'path';
import axios from 'axios';

import type { IPlugin } from '@cpany/core';
import { ICPanyPluginConfig, IHandle, isLuogu } from '@cpany/types';
import { listJsonFiles } from '@cpany/utils';

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

export async function luoguPlugin(config: ICPanyPluginConfig): Promise<IPlugin[]> {
  const cookie = loadCookie();

  for (const handlePath of config.handles) {
    const fullPath = path.resolve(config.basePath, handlePath);
    for await (const handle of listJsonFiles<IHandle>(fullPath)) {
      if (isLuogu(handle)) {
        addToCache(handle);
      }
    }
  }

  const api = axios.create({
    baseURL: 'https://www.luogu.com.cn/',
    headers: {
      'x-luogu-type': 'content-only',
      Cookie: `_uid=${cookie.uid}; __client_id=${cookie.clientId}`
    }
  });

  return [createLuoguHandlePlugin(api)];
}
