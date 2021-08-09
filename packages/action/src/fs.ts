import { join, dirname } from 'path';
import { writeFileSync } from 'fs';
import dayjs from 'dayjs';

import { mkdirP } from '@actions/io';
import { exec } from '@actions/exec';

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

  const add = async (path: string, content: string) => {
    const fullPath = join(basePath, path);
    files.push(fullPath);
    await mkdirP(dirname(fullPath));
    writeFileSync(fullPath, content, 'utf8');
  };

  const push = async () => {
    await exec('git', ['add', ...files]);
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
