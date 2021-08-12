import type { IHandle } from './handle';
import type { IContest } from './contest';

export * from './enum';

export * from './handle';

export * from './submission';

export * from './problem';

export * from './contest';

export type RouteKey<T, K = number> = T & {
  type: string;
  key: K;
  path: string;
};

export interface ICPanyConfig {
  users?: Record<string, Record<string, string[] | string>>;
  handles?: string[];
  contests?: string[];
  fetch?: string[];
  static?: string[];
}

export interface ICPanyUser {
  name: string;
  handles: Array<IHandle>;
  contests: Array<IContest>;
}
