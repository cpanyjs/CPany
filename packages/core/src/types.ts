import type { Key, IContest, IHandle, IUser, ResolvedCPanyOption } from '@cpany/types';

import { Logger, LogLevel } from './logger';
import { CPanyPlugin } from './plugin';

export interface CreateOptions {
  plugins?: Array<CPanyPlugin | CPanyPlugin[] | null | undefined>;

  logger?: Logger;

  logLevel?: LogLevel;
}

export interface CPanyInstance extends FSOperations {
  logger: Logger;

  platforms: string[];

  fetchAll: (option: ResolvedCPanyOption) => Promise<void>;

  loadAll: (option: ResolvedCPanyOption) => Promise<{
    handles: Array<Key<IHandle>>;
    contests: Array<Key<IContest>>;
    users: IUser[];
  }>;

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
