import path from 'path';
import axios from 'axios';

import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig } from '@cpany/types';
import { listFiles } from '@cpany/utils';

import { createAtCoderHandlePlugin } from './handle';
import { createAtCoderContestPlugin } from './contest';

function loadCookie(): string {
  const session = process.env.REVEL_SESSION;
  if (!session) {
    console.error('Please set env variable REVEL_SESSION!');
    process.exit(1);
  }
  return session!;
}

export function atcoderPlugin(config: ICPanyConfig & { basePath: string }): IPlugin[] {
  const configUsers = config.users ?? {};
  const handleMap = new Map<string, string>();
  for (const username in configUsers) {
    const user = configUsers[username];
    for (const type in user) {
      if (type.startsWith('atcoder')) {
        const rawHandles = user[type];
        const handles = typeof rawHandles === 'string' ? [rawHandles] : rawHandles;
        for (const handle of handles) {
          handleMap.set(handle, username);
        }
      }
    }
  }

  const cookie = loadCookie();

  const api = axios.create({
    baseURL: 'https://atcoder.jp/',
    headers: {
      Cookie: `REVEL_FLASH=; REVEL_SESSION=${cookie}`
    }
  });

  return [
    createAtCoderHandlePlugin(api),
    createAtCoderContestPlugin(api, handleMap),
    {
      name: 'atcoder/clean',
      async clean() {
        const fullPath = path.resolve(config.basePath, 'atcoder/handle');
        const files: string[] = [];
        try {
          for await (const file of listFiles(fullPath)) {
            files.push(file);
          }
        } catch (error) {}
        return { files };
      }
    }
  ];
}
