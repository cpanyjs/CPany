import type { IPlugin } from '@cpany/core';
import type { ICPanyConfig } from '@cpany/types';
import type { IHandleWithHdu } from '@cpany/types/hdu';

import path from 'path';
import { promises } from 'fs';

import { createHduHandlePlugin, addToCache } from './handle';

export async function hduPlugin(
  config: ICPanyConfig & { basePath: string }
): Promise<IPlugin[]> {
  for (const handlePath of config.handles ?? []) {
    const fullPath = path.resolve(config.basePath, handlePath);
    try {
      for await (const handle of listAllFiles<IHandleWithHdu>(fullPath)) {
        if (handle.type.startsWith('hdu')) {
          addToCache(handle);
        }
      }
    } catch (error) {}
  }

  return [createHduHandlePlugin()];
}

async function* listAllFiles<T>(dir: string): AsyncGenerator<T> {
  if (dir.endsWith('.json')) {
    const files: T | T[] = JSON.parse(await promises.readFile(dir, 'utf8'));
    if (Array.isArray(files)) {
      for (const contest of files) {
        yield contest;
      }
    } else {
      yield files;
    }
  } else {
    const dirents = await promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const id = path.join(dir, dirent.name);
      yield* listAllFiles(id);
    }
  }
}
