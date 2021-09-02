import { promises } from 'fs';
import path from 'path';

export async function* listAllFiles<T>(
  dir: string,
  suffix = '.json'
): AsyncGenerator<T> {
  if (dir.endsWith(suffix)) {
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
