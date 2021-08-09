import { join, dirname } from 'path';
import { writeFileSync, promises } from 'fs';

import { mkdirP } from '@actions/io';
import { exec } from '@actions/exec';

import { listDir } from './utils';

export async function createGitFileSystem(
  basePath: string,
  skipList: Set<string> = new Set()
) {
  const username = process.env.GITHUB_ACTOR || 'Unknown';
  await exec('git', ['config', '--global', 'user.name', username]);
  await exec('git', [
    'config',
    '--global',
    'user.email',
    `${username}@users.noreply.github.com`
  ]);

  const files: Set<string> = new Set();

  for await (const file of listDir('.', skipList)) {
    await promises.unlink(file);
    files.add(file);
  }

  const add = async (path: string, content: string) => {
    const fullPath = join(basePath, path);
    files.add(fullPath);
    await mkdirP(dirname(fullPath));
    writeFileSync(fullPath, content, 'utf8');
  };

  const push = async (time: string) => {
    await exec('git', ['add', ...files]);
    await exec('git', ['commit', '-m', `Fetch data on ${time}`]);
    await exec('git', ['push']);
  };

  return {
    add,
    push
  };
}
