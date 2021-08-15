import type { IAuthor, IHandle } from './handle';
import type { IContest } from './contest';
import type { ISubmission } from './submission';

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
  contests: Array<IContestOverview & { author: IAuthor }>;
  submissions: Array<ISubmission>;
}
