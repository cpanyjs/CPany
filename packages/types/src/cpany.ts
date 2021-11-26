import { IHandle, IAuthor } from './handle';
import { IContest } from './contest';

export interface IUser {
  name: string;
  handles: Array<RouteKey<IHandle>>;
  contests: Array<RouteKey<IContest> & { author: IAuthor }>;
}

export interface CPanyOption {
  users?: Record<string, Record<string, string | string[] | Record<string, string | string[]>>>;

  handles?: string[];

  contests?: string[];

  fetch?: string[];

  static?: string[];

  app?: Partial<AppOption>;
}

export interface ResolvedCPanyUserOption {
  /**
   * Username
   */
  name: string;

  handle: Array<{
    platform: string;
    handle: string;
  }>;
}

export interface ResolvedCPanyOption {
  /**
   * Absolute data root path
   */
  dataRoot: string;

  /**
   * Flattern users option
   */
  users: Array<ResolvedCPanyUserOption>;

  static: {
    /**
     * Absolute directories for external handles
     */
    handles: Array<string>;

    /**
     * Absolute directories for external contests
     */
    contests: Array<string>;

    /**
     * Absolute directories for external blog posts
     */
    blogs: Array<{}>;
  };

  /**
   * App options
   */
  app: AppOption;
}

export type ICPanyPluginConfig = ResolvedCPanyOption & { baseUrl: string; };

// Action/Cli config interface
export interface AppOption {
  /**
   * @default ""
   */
  title: string;

  /**
   * @default 2592000
   */
  recentTime: number;

  /**
   * @default 15
   */
  recentContestsCount: number;

  /**
   * @default 5
   */
  recentUserCount: number;

  /**
   * @default "['members', 'codeforces', 'contests']"
   */
  nav: string[];
}

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
