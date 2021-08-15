import { join } from 'path';
import { promises } from 'fs';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

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
  return dayjs().tz('Asia/Shanghai');
}

export function sleep(duration: number): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), duration));
}
