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
        const fullPath = path.resolve(config.dataRoot, 'atcoder/handle');
        const files: string[] = [];
        for await (const file of listFiles(fullPath)) {
          files.push(file);
        }
        return { files };
      }
    }
  ];
}

export default atcoderPlugin;

function loadContest(config: ICPanyPluginConfig) {
  try {
    const contests = JSON.parse(
      fs.readFileSync(path.resolve(config.dataRoot, 'atcoder/contest.json'), 'utf-8')
    ) as IContest[];
    addContests(contests);
  } catch {}
}

function loadHandleMap(config: ICPanyPluginConfig) {
  const handleMap = new Map<string, string>();
  for (const user of config.users) {
    for (const handle of user.handle) {
      if (isAtCoder({ type: handle.platform })) {
        handleMap.set(handle.handle, user.name);
      }
    }
  }
  return handleMap;
}
