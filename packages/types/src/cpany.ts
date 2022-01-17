import { IHandle, IAuthor } from './handle';
import { IContest } from './contest';

export interface IUser {
  name: string;
  key: string;
  handles: Array<IHandle>;
  contests: Array<Key<IContest & { author: IAuthor }>>;
}

export interface IRouteUser {
  name: string;
  key: string;
  path: string;
  handles: Array<IHandle>;
  contests: Array<RouteKey<IContest & { author: IAuthor }>>;
}

export interface CPanyOption {
  users?: Record<string, Record<string, string | string[] | Record<string, string | string[]>>>;

  handles?: string[];

  contests?: string[];

  fetch?: string[];

  static?: string[];

  app?: Partial<AppOption>;

  plugins?: string[];
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

export type ICPanyPluginConfig = ResolvedCPanyOption & { baseUrl: string };

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

export interface UserDiffLog {
  name: string;

  newSubmissions: {
    platfrom: string;
    id: number | string;
    name: string;
    verdict: string;
  };

  newContests: {
    platfrom: string;
    name: string;
  };
}

export interface DiffLog {
  user?: UserDiffLog[];

  contest?: Array<{
    platform: string;
    name: string;
    startTime: number;
    duration: number;
    participantNumber: number;
  }>;
}

export interface FetchLog {
  /**
   * CLI version running fetch
   */
  version: string;

  updateTime: number;

  history?: DiffLog;
}

export type Key<T> = T & { key: string };

export type RouteKey<T> = T & {
  type: string;
  key: string;
  path: string;
};

export type IContestOverview = Omit<Key<IContest>, 'standings'>;

export interface IUserOverview {
  name: string;
  handles: Array<Omit<IHandle, 'submissions'>>;

  // t: short for participantTime
  contests: Array<{ type: string; t: number }>;
  // t: short for creationTime
  // v: short for Verdict, v = 0 => wrong, v = 1 => ok, v = -1 => duplicate ok
  // d: difficult score
  submissions: Array<{ type: string; t: number; v: number; d?: number }>;
}

export type CompressHandleList = Array<{ n: string; h: string; r: number }>;
