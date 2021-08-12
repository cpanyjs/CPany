import type { Verdict } from './enum';
import type { IAuthor } from './handle';
import type { IContestProblem } from './problem';

export interface IContest {
  type: string;
  name: string;
  startTime: number;
  duration: number;
  id?: number | string;
  phase?: string;
  contestUrl?: string;
  standingsUrl?: string;
  problems?: IContestProblem[];
  standings?: IContestStanding[];
}

export interface IContestStanding {
  author: IAuthor;
  rank: number;
  solved: number;
  penalty: number;
  submissions: IContestSubmission[];
}

export interface IContestSubmission {
  id: number;
  creationTime: number;
  relativeTime: number;
  problemIndex: number;
  verdict?: Verdict; // default: Incorrect
  dirty?: number; // default: 0
  language?: string; // default: Unknown
  submissionUrl?: string; // default: Empty
}
