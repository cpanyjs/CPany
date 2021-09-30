import type { IAuthor, IHandle } from './handle';
import type { IContest } from './contest';

export * from './enum';

export * from './handle';

export * from './submission';

export * from './problem';

export * from './contest';

// Action/Cli config interface
export interface AppConfig {
  title: string;
  recentTime: number;
  recentContestsCount: number;
  recentUserCount: number;
}

export interface ICPanyConfig {
  users?: Record<string, Record<string, string[] | string>>;
  handles?: string[];
  contests?: string[];
  fetch?: string[];
  static?: string[];

  app?: Partial<AppConfig>;
}

export type RouteKey<T, K = number> = T & {
  type: string;
  key: K;
  path: string;
};

export interface IUser {
  name: string;
  handles: Array<RouteKey<IHandle>>;
  contests: Array<RouteKey<IContest> & { author: IAuthor }>;
}

export type IContestOverview = Omit<RouteKey<IContest>, 'standings'>;

export interface IUserOverview {
  name: string;
  handles: Array<Omit<RouteKey<IHandle>, 'submissions'>>;

  // t: short for participantTime
  contests: Array<{ type: string; t: number }>;
  // t: short for creationTime
  // v: short for Verdict, v = 0 => wrong, v = 1 => ok, v = -1 => duplicate ok
  // d: difficult score
  submissions: Array<{ type: string; t: number; v: number; d?: number }>;
}

export type CompressHandleList = Array<{ n: string; h: string; r: number }>;
