import { promises } from 'fs';
import path from 'path';

export async function* listJsonFiles<T>(dir: string): AsyncGenerator<T> {
  try {
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
        yield* listJsonFiles(id);
      }
    }
  } catch {}
}

export async function* listFiles(
  dir: string,
  skipList: Set<string> = new Set()
): AsyncGenerator<string> {
  try {
    const dirents = await promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const id = path.join(dir, dirent.name);
      if (dirent.name.startsWith('.') || skipList.has(id)) {
        continue;
      }
      if (dirent.isDirectory()) {
        yield* listFiles(id, skipList);
      } else {
        yield id;
      }
    }
  } catch {}
}
