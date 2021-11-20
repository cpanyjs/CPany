import { IHandle, IAuthor } from "./handle";
import { IContest } from "./contest";

export interface IUser {
  name: string;
  handles: Array<RouteKey<IHandle>>;
  contests: Array<RouteKey<IContest> & { author: IAuthor }>;
}

export interface ICPanyConfig {
  users?: Record<string, Record<string, string[] | string>>;
  handles?: string[];
  contests?: string[];
  fetch?: string[];
  static?: string[];

  app?: Partial<AppConfig>;
}

export interface IResolvedCPanyConfig {
  users: Array<IUser>;

  handles: Array<IHandle>;

  contests: Array<IContest>;

  blogs: Array<{}>;

  app: AppConfig
}

// Action/Cli config interface
export interface AppConfig {
  title: string;
  recentTime: number;
  recentContestsCount: number;
  recentUserCount: number;
  // default: ['members', 'codeforces', 'contests'];
  nav: string[];
}

export type ICPanyPluginConfig = Required<ICPanyConfig> & { basePath: string; timeout?: number };

export type RouteKey<T, K = number> = T & {
  type: string;
  key: K;
  path: string;
};

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
