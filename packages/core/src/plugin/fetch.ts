import type { Logger } from '../logger';

export type CPanyPlugin = CachePlugin | FetchPlugin | QueryPlugin;

interface BasicPlugin {
  name: string;

  platform: string;

  enforce?: 'pre' | 'post';
}

// Cache manipulation
export interface CachePlugin extends BasicPlugin {
  cache: (context: FetchContext) => Promise<void>;
}

// Fetch a single file
export interface FetchPlugin extends BasicPlugin {
  fetch: (context: FetchContext) => Promise<FetchResult | string | null | undefined>;
}

// Query
export interface QueryPlugin extends BasicPlugin {
  query: (
    payload: string,
    context: FetchContext
  ) => Promise<FetchResult | string | null | undefined>;
}

export interface FetchContext {
  logger: Logger;

  readJsonFile: <T>(filename: string) => Promise<T>;

  readJsonDir: <T>(rootDir: string) => Promise<T[]>;

  listDir: (rootDir: string) => Promise<string[]>;

  writeFile: (content: string, filename: string) => Promise<void>;

  removeFile: (filename: string) => Promise<void>;
}

export interface FetchResult {
  filename: string;

  content: string;
}
