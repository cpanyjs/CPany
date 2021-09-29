import axios from 'axios';
import path from 'path';

import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig } from '@cpany/types';
import { listFiles } from '@cpany/utils';

import { contestListPlugin, gymContestListPlugin } from './contest';
import { handleInfoPlugin } from './handle';

export * from './constant';
export interface ICodeforcesPluginOption {
  basePath: string;
  baseUrl?: string;
  timeout?: number;
}

export function codeforcesPlugin(option: ICodeforcesPluginOption & ICPanyConfig): IPlugin[] {
  const api = axios.create({
    baseURL: option.baseUrl ?? 'https://codeforces.com/api/',
    timeout: option.timeout ?? 30 * 1000
  });

  return [
    contestListPlugin(api),
    gymContestListPlugin(api),
    handleInfoPlugin(api),
    codeforcesCleanPlugin(option.basePath)
  ];
}

function codeforcesCleanPlugin(basePath: string): IPlugin {
  return {
    name: 'codeforces/clean',
    async clean() {
      const fullPath = path.resolve(basePath, 'codeforces/handle');
      const files: string[] = [];
      try {
        for await (const file of listFiles(fullPath)) {
          files.push(file);
        }
      } catch (error) {}
      return { files }
    }
  }
}
