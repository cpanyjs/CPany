import { join, dirname, resolve } from 'path';
import { writeFileSync, unlinkSync } from 'fs';

import { mkdirP } from '@actions/io';
import { exec } from '@actions/exec';

interface IGitFSOption {
  disable?: boolean;
}

export async function createGitFileSystem(
  basePath: string,
  { disable = false }: IGitFSOption = {}
) {
  const files: Set<string> = new Set();

  const rm = async (path: string) => {
    if (disable) return;
    const fullPath = resolve(basePath, path);
    files.add(path);
    unlinkSync(fullPath);
  };

  const add = async (path: string, content: string) => {
    const fullPath = join(basePath, path);
    files.add(fullPath);
    await mkdirP(dirname(fullPath));
    writeFileSync(fullPath, content, 'utf8');
  };

  const push = async (time: string) => {
    if (disable) return;
    const username = process.env.GITHUB_ACTOR || 'Unknown';
    await exec('git', ['config', '--local', 'user.name', username]);
    await exec('git', [
      'config',
      '--local',
      'user.email',
      `${username}@users.noreply.github.com`
    ]);
    await exec('git', [
      'add',
      resolve(basePath, 'README.md'),
      resolve(basePath, '.env'),
      ...files
    ]);
    await exec('git', ['commit', '-m', `Fetch data on ${time}`]);
    await exec('git', ['push']);
  };

  return {
    add,
    rm,
    push
  };
}
