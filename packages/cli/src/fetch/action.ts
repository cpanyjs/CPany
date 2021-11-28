import fs from 'fs';
import path from 'path';
import debug from 'debug';
import { lightRed, dim, underline } from 'kolorist';

import type { LogLevel } from '@cpany/types';

import type { ICliOption } from '../types';
import { createCPany } from '../cpany';
import { now, slash, listDir } from '../utils';

import { processReport } from './report';
// import { createGitFileSystem } from './fs';

const debugFetch = debug('cpany:fetch');

export interface IRunOption {
  logLevel?: LogLevel;
  basePath?: string;
  plugins?: string[];
  maxRetry: number;
}

export async function run(option: ICliOption) {
  const fetcher = await createCPany(option);

  fetcher.on('read', async (...paths: string[]) => {
    const fullPath = path.join(option.dataRoot, ...paths);
    return await fs.promises.readFile(fullPath, 'utf-8');
  });
  fetcher.on('list', async (platform: string, ...paths: string[]) => {
    const rootDir = path.join(option.dataRoot, ...paths);
    const files = [];
    for await (const file of listDir(rootDir)) {
      files.push(path.relative(path.join(option.dataRoot, platform), file));
    }
    return files;
  });
  fetcher.on('write', async (content: string, ...paths: string[]) => {
    const fullPath = path.join(option.dataRoot, ...paths);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true }).catch(() => {});
    await fs.promises.writeFile(fullPath, content, 'utf-8');
    fetcher.logger.info(
      `Write: ${underline(slash(fullPath))} ${dim(`(size: ${binarySize(content)})`)}`
    );
  });
  fetcher.on('remove', async (...paths: string[]) => {
    const fullPath = path.join(option.dataRoot, ...paths);
    await fs.promises.unlink(fullPath);
    fetcher.logger.info(`${lightRed('Remove:')} ${underline(slash(fullPath))}`);
  });

  await fetcher.fetchAll(option.option);

  const nowTime = now();
  debugFetch(nowTime);

  try {
    await processReport(option.dataRoot, nowTime);
  } catch (error: any) {
    const msg = error.message;
    if (typeof msg === 'string') {
      fetcher.logger.error(`Error: ${msg}`);
    } else {
      fetcher.logger.error(`Error: unknown, when process report`);
    }
  }
  // TODO: push
  // await fs.push(format(nowTime, 'yyyy-MM-dd HH:mm'));
}

function getBinarySize(text: string) {
  return Buffer.byteLength(text, 'utf8');
}

function binarySize(text: string) {
  const size = getBinarySize(text);
  if (size < 1024) {
    return `${size} B`;
  } else {
    return `${(size / 1024).toFixed(2)} KB`;
  }
}
