import fs from 'fs';
import path from 'path';
import axios from 'axios';

import type { IPlugin } from '@cpany/core';
import { ICPanyPluginConfig, IContest, isAtCoder } from '@cpany/types';
import { listFiles } from '@cpany/utils';

import { createAtCoderHandlePlugin } from './handle';
import { addContests, createAtCoderContestPlugin } from './contest';

function loadCookie(): string {
  const session = process.env.REVEL_SESSION;
  if (!session) {
    console.error('Please set env variable REVEL_SESSION !');
    process.exit(1);
  }
  return session!;
}

export function atcoderPlugin(config: ICPanyPluginConfig): IPlugin[] {
  loadContest(config);
  const handleMap = loadHandleMap(config);

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
        for await (const file of listFiles(fullPath)) {
          files.push(file);
        }
        return { files };
      }
    }
  ];
}

function loadContest(config: ICPanyPluginConfig) {
  try {
    const contests = JSON.parse(
      fs.readFileSync(path.resolve(config.basePath, 'atcoder/contest.json'), 'utf-8')
    ) as IContest[];
    addContests(contests);
  } catch {}
}

function loadHandleMap(config: ICPanyPluginConfig) {
  const handleMap = new Map<string, string>();
  for (const username in config.users) {
    const user = config.users[username];
    for (const type in user) {
      if (isAtCoder({ type })) {
        const rawHandles = user[type];
        const handles = typeof rawHandles === 'string' ? [rawHandles] : rawHandles;
        for (const handle of handles) {
          handleMap.set(handle, username);
        }
      }
    }
  }
  return handleMap;
}
