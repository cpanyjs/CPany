import { join } from 'path';
import { promises } from 'fs';
import { utcToZonedTime } from 'date-fns-tz';

export async function* listDir(
  dir: string,
  skipList: Set<string> = new Set()
): AsyncGenerator<string> {
  const dirents = await promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const id = join(dir, dirent.name);
    if (dirent.name.startsWith('.') || skipList.has(id)) {
      continue;
    }
    if (dirent.isDirectory()) {
      yield* listDir(id, skipList);
    } else {
      yield id;
    }
  }
}

export function now() {
  return utcToZonedTime(new Date(), 'Asia/Shanghai');
}
