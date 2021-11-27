import { ResolvedCPanyOption } from '@cpany/types';

import { Logger, LogLevel } from './logger';
import { CPanyPlugin } from './plugin';

export interface CreateOptions {
  plugins?: Array<CPanyPlugin | CPanyPlugin[] | null | undefined>;

  logger?: Logger;

  logLevel?: LogLevel;
}

export interface CPanyFetcher extends FSOperations {
  logger: Logger;

  platforms: string[];

  run: (option: ResolvedCPanyOption) => Promise<void>;

  cache: () => Promise<void>;

  fetch: (platform: string, name: string) => Promise<string | undefined>;

  query: (platform: string, name: string, payload: string | number) => Promise<string | undefined>;
}

export interface FSOperations {
  on: <T extends keyof FSEventType>(event: T, fn: FSEventType[T]) => void;
}

/**
 * Paths are relative under the data root directory.
 */
export interface FSEventType {
  read: (...paths: string[]) => Promise<string>;
  list: (platform: string, ...paths: string[]) => Promise<string[]>;
  write: (content: string, ...paths: string[]) => Promise<void>;
  remove: (...paths: string[]) => Promise<void>;
}
