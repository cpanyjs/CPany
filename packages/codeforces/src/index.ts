import axios from 'axios';
import path from 'path';

import type { IPlugin } from '@cpany/core';
import type { ICPanyPluginConfig } from '@cpany/types';
import { listFiles } from '@cpany/utils';

import { contestListPlugin, gymContestListPlugin } from './contest';
import { handleInfoPlugin } from './handle';

export * from './constant';

export function codeforcesPlugin(option: ICPanyPluginConfig): IPlugin[] {
  const api = axios.create({
    baseURL: option.baseUrl ?? 'https://codeforces.com/api/',
    timeout: 30 * 1000
  });

  console.log(option);
  

  return [
    contestListPlugin(api),
    gymContestListPlugin(api),
    handleInfoPlugin(api),
    codeforcesCleanPlugin(option.dataRoot)
  ];
}

export default codeforcesPlugin;

function codeforcesCleanPlugin(basePath: string): IPlugin {
  return {
    name: 'codeforces/clean',
    async clean() {
      const fullPath = path.resolve(basePath, 'codeforces/handle');
      const files: string[] = [];
      for await (const file of listFiles(fullPath)) {
        files.push(file);
      }
      return { files };
    }
  };
}
