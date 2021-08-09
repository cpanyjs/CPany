import { join, dirname } from 'path';
import { writeFileSync, promises } from 'fs';
import dayjs from 'dayjs';

import { mkdirP } from '@actions/io';
import { exec } from '@actions/exec';

async function* listDir(
  dir: string,
  skipList: Set<string>
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

export async function createGitFileSystem(basePath: string) {
  const username = process.env.GITHUB_ACTOR || 'Unknown';
  await exec('git', ['config', '--global', 'user.name', username]);
  await exec('git', [
    'config',
    '--global',
    'user.email',
    `${username}@users.noreply.github.com`
  ]);

  const files: string[] = [];

  for await (const file of listDir(
    '.',
    new Set(['cpany.yml', 'README.md', 'main'])
  )) {
    await promises.unlink(file);
    files.push(file);
  }

  const add = async (path: string, content: string) => {
    const fullPath = join(basePath, path);
    files.push(fullPath);
    await mkdirP(dirname(fullPath));
    writeFileSync(fullPath, content, 'utf8');
  };

  const push = async () => {
    await exec('git', ['add', ...new Set(files)]);
    await exec('git', [
      'commit',
      '-m',
      `Fetch data on ${dayjs().format('YYYY-MM-DD HH:mm')}`
    ]);
    await exec('git', ['push']);
  };

  return {
    add,
    push
  };
}
