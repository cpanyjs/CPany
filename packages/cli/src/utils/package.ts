import path from 'path';
import { readFileSync } from 'fs';

export const packageInfo = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
);

export const version = packageInfo.version;
