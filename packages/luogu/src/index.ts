import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig, IHandle } from '@cpany/types';
import { listJsonFiles } from '@cpany/utils';

import path from 'path';

import { createLuoguHandlePlugin } from './handle';

export async function luoguPlugin(
  config: ICPanyConfig & { basePath: string }
): Promise<IPlugin[]> {
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

  return [
    createLuoguHandlePlugin(),
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
