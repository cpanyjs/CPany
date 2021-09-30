import path from 'path';
import { readFileSync } from 'fs';

export const version = JSON.parse(
  readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8')
).version;
