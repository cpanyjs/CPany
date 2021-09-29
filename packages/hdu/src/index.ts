import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig } from '@cpany/types';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import { listJsonFiles } from '@cpany/utils';

import path from 'path';

import { createHduHandlePlugin, addToCache } from './handle';

export async function hduPlugin(config: ICPanyConfig & { basePath: string }): Promise<IPlugin[]> {
  for (const handlePath of config.handles ?? []) {
    const fullPath = path.resolve(config.basePath, handlePath);
    try {
      for await (const handle of listJsonFiles<IHandleWithHdu>(fullPath)) {
        if (handle.type.startsWith('hdu')) {
          addToCache(handle);
        }
      }
    } catch (error) {}
  }

  return [
    createHduHandlePlugin(),
    {
      name: 'hdu/clean',
      async load(id) {
        if (id === 'hdu/clean') {
          return '[]';
        }
        return null;
      }
    }
  ];
}
