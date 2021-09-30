import path from 'path';
import axios from 'axios';

import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig } from '@cpany/types';
import { listFiles } from '@cpany/utils';

import { createAtCoderHandlePlugin } from './handle';

function loadCookie(): string {
  const session = process.env.REVEL_SESSION;
  if (!session) {
    console.error('Please set env variable REVEL_SESSION!');
    process.exit(1);
  }
  return session!;
}

export function atcoderPlugin(config: ICPanyConfig & { basePath: string }): IPlugin[] {
  const cookie = loadCookie();

  const api = axios.create({
    baseURL: 'https://atcoder.jp/',
    headers: {
      Cookie: `REVEL_FLASH=; REVEL_SESSION=${cookie}`
    }
  });

  return [
    createAtCoderHandlePlugin(api),
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
