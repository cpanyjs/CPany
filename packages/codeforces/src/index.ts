import axios from 'axios';

import type { CPanyPlugin } from '@cpany/core';
import type { ICPanyPluginConfig } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';

import { codeforces } from './constant';
import { handleInfoPlugin } from './handle';
import { loadCodeforcesPlugin } from './load';
import { contestListPlugin, gymContestListPlugin } from './contest';
import { diffCodeforcesPlugin } from './diff';

export * from './constant';

const delay = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function codeforcesPlugin(option: ICPanyPluginConfig): CPanyPlugin[] {
  const api = axios.create({
    baseURL: option.baseUrl ?? 'https://codeforces.com/api/',
    timeout: 30 * 1000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  const originalGet = api.get.bind(api);
  const originalPost = api.post.bind(api);
  api.get = async function (...args: Parameters<typeof originalGet>) {
    await delay(800);
    return originalGet(...args);
  } as typeof api.get;

  api.post = async function (...args: Parameters<typeof originalPost>) {
    await delay(800);
    return originalPost(...args);
  } as typeof api.post;

  const oldHandles: IHandleWithCodeforces[] = [];
  const newHandles: IHandleWithCodeforces[] = [];

  return [
    contestListPlugin(api),
    gymContestListPlugin(api),
    handleInfoPlugin(api, newHandles),
    codeforcesCleanPlugin(oldHandles),
    diffCodeforcesPlugin(oldHandles, newHandles),
    loadCodeforcesPlugin()
  ];
}

export default codeforcesPlugin;

function codeforcesCleanPlugin(handles: IHandleWithCodeforces[]): CPanyPlugin {
  return {
    name: 'cache',
    platform: codeforces,
    async cache(ctx) {
      const files = await ctx.listDir('handle');
      for (const file of files) {
        handles.push(await ctx.readJsonFile(file));
        await ctx.removeFile(file);
      }
    }
  };
}
